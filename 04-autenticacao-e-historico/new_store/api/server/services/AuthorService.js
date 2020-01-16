import database from '../src/models'

class AuthorService {
  static async getAllAuthors() {
    try {
      console.log(await database.sequelize.models.AuthorHistory.findAll())
      return await database.sequelize.models.Author.findAll()
    } catch (error) {
      throw error
    }
  }

  static async addAuthor(newAuthor) {
    try {
      return await database.sequelize.models.Author.create(newAuthor)
    } catch (error) {
      throw error
    }
  }

  static async updateAuthor(id, updateAuthor) {
    try {
      const authorToUpdate = await database.sequelize.models.Author.findOne({
        where: { id: Number(id) }
      })

      if (authorToUpdate) {
        await database.sequelize.models.Author.update(updateAuthor, { where: { id: Number(id) } })

        return updateAuthor
      }
      return null
    } catch (error) {
      throw error
    }
  }

  static async getAuthor(id) {
    try {
      const theAuthor = await database.sequelize.models.Author.findOne({
        where: { id: Number(id) }
      })

      return theAuthor
    } catch (error) {
      throw error
    }
  }

  static async deleteAuthor(id) {
    try {
      const authorToDelete = await database.sequelize.models.Author.findOne({ where: { id: Number(id) } })

      if (authorToDelete) {
        const deletedAuthor = await database.sequelize.models.Author.destroy({
          where: { id: Number(id) }
        })
        return deletedAuthor
      }
      return null
    } catch (error) {
      throw error
    }
  }
}

export default AuthorService
