import AuthorService from '../services/AuthorService'
import Util from '../utils/Utils'

const util = new Util()

class AuthorController {
  static async getAllAuthors(req, res) {
    try {
      const allAuthors = await AuthorService.getAllAuthors()
      if (allAuthors.length > 0) {
        util.setSuccess(200, 'Authors retrieved', allAuthors)
      } else {
        util.setSuccess(200, 'No Author found')
      }
      return util.send(res)
    } catch (error) {
      util.setError(400, error)
      return util.send(res)
    }
  }

  static async addAuthor(req, res) {
    console.log(req.body.name, req.body.is_alive,  typeof(req.body.is_alive))
    if (!req.body.name || !typeof(req.body.is_alive)==='boolean' ) {
      util.setError(400, 'Please provide complete details')
      return util.send(res)
    }
    const newAuthor = req.body
    try {
      const createdAuthor = await AuthorService.addAuthor(newAuthor)
      util.setSuccess(201, 'Author Added!', createdAuthor)
      return util.send(res)
    } catch (error) {
      util.setError(400, error.message)
      return util.send(res)
    }
  }

  static async updatedAuthor(req, res) {
    const alteredAuthor = req.body
    const { id } = req.params
    if (!Number(id)) {
      util.setError(400, 'Please input a valid numeric value')
      return util.send(res)
    }
    try {
      const updateAuthor = await AuthorService.updateAuthor(id, alteredAuthor)
      if (!updateAuthor) {
        util.setError(404, `Cannot find author with the id: ${id}`)
      } else {
        util.setSuccess(200, 'Author updated', updateAuthor)
      }
      return util.send(res)
    } catch (error) {
      util.setError(404, error)
      return util.send(res)
    }
  }

  static async getAuthor(req, res) {
    const { id } = req.params

    if (!Number(id)) {
      util.setError(400, 'Please input a valid numeric value')
      return util.send(res)
    }

    try {
      const theAuthor = await AuthorService.getAuthor(id)

      if (!theAuthor) {
        util.setError(404, `Cannot find Author with the id ${id}`)
      } else {
        util.setSuccess(200, 'Found Author', theAuthor)
      }
      return util.send(res)
    } catch (error) {
      util.setError(404, error)
      return util.send(res)
    }
  }

  static async deleteAuthor(req, res) {
    const { id } = req.params

    if (!Number(id)) {
      util.setError(400, 'Please provide a numeric value')
      return util.send(res)
    }

    try {
      const authorToDelete = await AuthorService.deleteAuthor(id)

      if (authorToDelete) {
        util.setSuccess(200, 'Author deleted')
      } else {
        util.setError(404, `Author with the id ${id} cannot be found`)
      }
      return util.send(res)
    } catch (error) {
      util.setError(400, error)
      return util.send(res)
    }
  }
}

export default AuthorController
