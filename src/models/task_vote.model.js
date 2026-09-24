const db = require("../database/db");

class TaskVoteModel {

    /**
     * 根据 task_id 获取投票任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object|undefined} 投票任务配置
     */
    static getVoteByTaskId(task_id) {
        const stmt = db.prepare("SELECT * FROM task_vote WHERE task_id = ?");
        return stmt.get(task_id);
    }

    /**
     * 创建投票任务配置
     * @param {Object} voteData - 投票任务数据
     * @param {number} voteData.task_id - 任务 ID
     * @param {Array<string>} [voteData.voters] - 参与投票的用户 ID 列表
     * @param {boolean} [voteData.multiple] - 是否多选
     * @param {number} [voteData.max_choices] - 多选时的最多可选数量
     * @param {boolean} [voteData.anonymous] - 是否匿名投票
     * @returns {Object} 创建结果
     */
    static createVote({ task_id, voters, multiple, max_choices, anonymous }) {
        const stmt = db.prepare(`
            INSERT INTO task_vote (task_id, voters, multiple, max_choices, anonymous)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(
            task_id,
            voters ? JSON.stringify(voters) : null,
            multiple ? 1 : 0,
            Number.isInteger(max_choices) ? max_choices : null,
            anonymous ? 1 : 0
        );
    }

    /**
     * 更新投票任务配置
     * @param {number} task_id - 任务 ID
     * @param {Object} voteData - 投票任务数据
     * @param {Array<string>} [voteData.voters] - 参与投票的用户 ID 列表
     * @param {boolean} [voteData.multiple] - 是否多选
     * @param {number|null} [voteData.max_choices] - 多选时的最多可选数量
     * @param {boolean} [voteData.anonymous] - 是否匿名投票
     * @returns {Object} 更新结果
     */
    static updateVote(task_id, { voters, multiple, max_choices, anonymous }) {
        const fields = [];
        const values = [];

        if (voters !== undefined) {
            fields.push("voters = ?");
            values.push(voters ? JSON.stringify(voters) : null);
        }
        if (multiple !== undefined) {
            fields.push("multiple = ?");
            values.push(multiple ? 1 : 0);
        }
        if (max_choices !== undefined) {
            fields.push("max_choices = ?");
            values.push(Number.isInteger(max_choices) ? max_choices : null);
        }
        if (anonymous !== undefined) {
            fields.push("anonymous = ?");
            values.push(anonymous ? 1 : 0);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(task_id);
        const stmt = db.prepare(`UPDATE task_vote SET ${fields.join(", ")} WHERE task_id = ?`);
        return stmt.run(...values);
    }

    /**
     * 删除投票任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteVote(task_id) {
        const stmt = db.prepare("DELETE FROM task_vote WHERE task_id = ?");
        return stmt.run(task_id);
    }

    /**
     * 根据 task_id 获取所有投票选项
     * @param {number} task_id - 任务 ID
     * @returns {Array} 投票选项列表
     */
    static getOptionsByTaskId(task_id) {
        const stmt = db.prepare("SELECT * FROM task_vote_option WHERE task_id = ? ORDER BY position ASC, option_id ASC");
        return stmt.all(task_id);
    }

    /**
     * 根据 option_id 获取投票选项
     * @param {number} option_id - 选项 ID
     * @returns {Object|undefined} 投票选项
     */
    static getOptionById(option_id) {
        const stmt = db.prepare("SELECT * FROM task_vote_option WHERE option_id = ?");
        return stmt.get(option_id);
    }

    /**
     * 创建投票选项
     * @param {Object} optionData - 选项数据
     * @param {number} optionData.task_id - 任务 ID
     * @param {string} optionData.content - 选项内容
     * @param {number} [optionData.position] - 选项顺序
     * @returns {Object} 创建结果
     */
    static createOption({ task_id, content, position }) {
        const stmt = db.prepare(`
            INSERT INTO task_vote_option (task_id, content, position)
            VALUES (?, ?, ?)
        `);
        return stmt.run(task_id, content, Number.isInteger(position) ? position : 0);
    }

    /**
     * 根据 task_id 删除所有投票选项
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteOptionsByTaskId(task_id) {
        const stmt = db.prepare("DELETE FROM task_vote_option WHERE task_id = ?");
        return stmt.run(task_id);
    }

    /**
     * 获取所有投票任务(附带 task_config 中的标题与起止时间), 按创建时间倒序
     * @returns {Array} 投票任务列表
     */
    static getAllVotes() {
        const stmt = db.prepare(`
            SELECT v.*, c.title, c.started_at, c.ended_at, c.source
            FROM task_vote AS v
            INNER JOIN task_config AS c ON c.task_id = v.task_id
            ORDER BY c.started_at DESC, v.task_id DESC
        `);
        return stmt.all();
    }

    /**
     * 根据 task_id 获取所有投票记录
     * @param {number} task_id - 任务 ID
     * @returns {Array} 投票记录列表
     */
    static getRecordsByTaskId(task_id) {
        const stmt = db.prepare("SELECT * FROM task_vote_record WHERE task_id = ?");
        return stmt.all(task_id);
    }

    /**
     * 获取某个用户在某个任务下的投票记录
     * @param {number} task_id - 任务 ID
     * @param {string} voter_id - 投票人 ID
     * @returns {Array} 投票记录列表
     */
    static getRecordsByVoter(task_id, voter_id) {
        const stmt = db.prepare("SELECT * FROM task_vote_record WHERE task_id = ? AND voter_id = ?");
        return stmt.all(task_id, voter_id);
    }

    /**
     * 统计每个选项的票数
     * @param {number} task_id - 任务 ID
     * @returns {Array<{option_id:number,count:number}>} 选项票数列表
     */
    static countByOption(task_id) {
        const stmt = db.prepare(`
            SELECT option_id, COUNT(*) AS count
            FROM task_vote_record
            WHERE task_id = ?
            GROUP BY option_id
        `);
        return stmt.all(task_id);
    }

    /**
     * 获取某个任务下已投票的用户 ID 列表
     * @param {number} task_id - 任务 ID
     * @returns {Array<string>} 已投票用户 ID 列表
     */
    static getVotedIdList(task_id) {
        const stmt = db.prepare("SELECT DISTINCT voter_id FROM task_vote_record WHERE task_id = ?");
        return stmt.all(task_id).map(record => record.voter_id);
    }

    /**
     * 用新的投票记录替换某个用户在该任务下的全部记录(两者在同一事务中完成)
     * @param {Object} params - 参数对象
     * @param {number} params.task_id - 任务 ID
     * @param {string} params.voter_id - 投票人 ID
     * @param {Array<number>} params.option_ids - 选项 ID 列表
     * @param {number} params.voted_at - 投票时间戳
     * @returns {{deleted:number,inserted:number}} 替换结果
     */
    static replaceVoterRecords({ task_id, voter_id, option_ids, voted_at }) {
        const deleteStmt = db.prepare("DELETE FROM task_vote_record WHERE task_id = ? AND voter_id = ?");
        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO task_vote_record (task_id, option_id, voter_id, voted_at)
            VALUES (?, ?, ?, ?)
        `);
        const replace = db.transaction(({ task_id, voter_id, option_ids, voted_at }) => {
            const deleted = deleteStmt.run(task_id, voter_id).changes;
            let inserted = 0;
            for (const option_id of option_ids) {
                inserted += insertStmt.run(task_id, option_id, voter_id, voted_at).changes;
            }
            return { deleted, inserted };
        });
        return replace({ task_id, voter_id, option_ids, voted_at });
    }

    /**
     * 根据 task_id 删除所有投票记录
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteRecordsByTaskId(task_id) {
        const stmt = db.prepare("DELETE FROM task_vote_record WHERE task_id = ?");
        return stmt.run(task_id);
    }

    /**
     * 判断某个用户是否参与过某个任务的投票(存在任意一条记录即视为已投票)
     * @param {number} task_id - 任务 ID
     * @param {string} voter_id - 投票人 ID
     * @returns {boolean} 是否已投票
     */
    static hasVoted(task_id, voter_id) {
        const stmt = db.prepare("SELECT 1 FROM task_vote_record WHERE task_id = ? AND voter_id = ? LIMIT 1");
        return stmt.get(task_id, voter_id) !== undefined;
    }
}

module.exports = TaskVoteModel;
