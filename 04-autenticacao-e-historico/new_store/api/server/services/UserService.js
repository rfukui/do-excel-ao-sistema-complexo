import database from '../src/models'
const User = User
class UserService {
  static async getAllUsers() {
    try {
      return await User.findAll()
    } catch (error) {
      throw error
    }
  }

  static async authenticate(req) {
      const {username, password} = req
      const user = await User.findOne(
        {where: {name: username + "", pass: password + ""}}
      )
        return user ? { name : user.name } : undefined

  }

  static async addUser(newUser) {
    try {
      return await User.create(newUser)
    } catch (error) {
      throw error
    }
  }

  static async updateUser(id, updateUser) {
    try {
      const userToUpdate = await User.findOne({
        where: { id: Number(id) }
      })

      if (userToUpdate) {
        await User.update(updateUser, { where: { id: Number(id) } })

        return updateUser
      }
      return null
    } catch (error) {
      throw error
    }
  }

  static async getUser(id) {
    try {
      const theUser = await User.findOne({
        where: { id: Number(id) }
      })

      return theUser
    } catch (error) {
      throw error
    }
  }

  static async deleteUser(id) {
    try {
      const userToDelete = await User.findOne({ where: { id: Number(id) } })

      if (userToDelete) {
        const deletedUser = await User.destroy({
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
