'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
        return [
            await queryInterface.addColumn('Bookmarks', 'background', {type: Sequelize.STRING}),
            await queryInterface.addColumn('Bookmarks', 'imageType', {type: Sequelize.STRING})
        ];
    },

    async down(queryInterface, Sequelize) {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */
        return [
            await queryInterface.removeColumn('Bookmark', 'background'),
            await queryInterface.removeColumn('Bookmark', 'imageType')
        ];
    }
};
