import database from '../src/models'

class UserService {
  static async getAllUsers() {
    try {
      return await database.User.findAll()
    } catch (error) {
      throw error
    }
  }
  static async authenticate(req) {
      const {username, password} = req
      const user = await database.User.findOne(
        { where : {
          name : username + "",
          pass : password + ""
        }}
      )
      if (user) {
          const { name } = user
          return { name }
      }
  }

  static async addUser(newUser) {
    try {
      return await database.User.create(newUser)
    } catch (error) {
      throw error
    }
  }

  static async updateUser(id, updateUser) {
    try {
      const userToUpdate = await database.User.findOne({
        where: { id: Number(id) }
      })

      if (userToUpdate) {
        await database.User.update(updateUser, { where: { id: Number(id) } })

        return updateUser
      }
      return null
    } catch (error) {
      throw error
    }
  }

  static async getUser(id) {
    try {
      const theUser = await database.User.findOne({
        where: { id: Number(id) }
      })

      return theUser
    } catch (error) {
      throw error
    }
  }

  static async deleteUser(id) {
    try {
      const userToDelete = await database.User.findOne({ where: { id: Number(id) } })

      if (userToDelete) {
        const deletedUser = await database.User.destroy({
          where: { id: Number(id) }
        })
        return deletedUser
      }
      return null
    } catch (error) {
      throw error
    }
  }
}

export default UserService
