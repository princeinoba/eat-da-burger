const connection = require('./connection');

const orm = {
  selectAll: async (tableName) => {
    const [rows] = await connection.query('SELECT * FROM ??', [tableName]);
    return rows;
  },
  insertOne: async (tableName, data) => {
    const [result] = await connection.query('INSERT INTO ?? SET ?',
      [
        tableName,
        data
      ]);
    return result;
  },
  updateOne: async (tableName, data, identifier) => {
    const result = await connection.query('UPDATE ?? SET ? WHERE ?',
      [
        tableName,
        data,
        identifier
      ]);
    return result;
  },
  deleteOne: async (tableName, identifier) => {
    const result = await connection.query('DELETE FROM ?? WHERE ?',
    [
      tableName,
      identifier
    ]);
  },
  findById: async (tableName, id) => {
    const [rows] = await connection.query('SELECT * FROM ?? WHERE ?', [tableName, {id}]);
    return rows.length ? rows : null;
  }
}

module.exports = orm;