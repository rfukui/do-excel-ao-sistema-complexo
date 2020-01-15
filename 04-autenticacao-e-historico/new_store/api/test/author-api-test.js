import chai from 'chai'
import chatHttp from 'chai-http'
import 'chai/register-should'
import app from '../index'
chai.use(chatHttp)
const { expect } = chai

describe('Testing the author endpoints:', () => {
  it('It should create a author', (done) => {
    const author = {
      name: 'First Awesome author',
      is_alive: true
    }
    chai.request(app)
      .post('/api/authors')
      .set('Accept', 'application/json')
      .send(author)
      .end((err, res) => {
        expect(res.status).to.equal(201)
        expect(res.body.data).to.include({
          id: 1,
          name: author.name,
          is_alive: author.is_alive
        })
        done()
      })
  })

  it('It should not create a author with incomplete parameters', (done) => {
    const author = {
      is_alive: true
    }
    chai.request(app)
      .post('/api/authors')
      .set('Accept', 'application/json')
      .send(author)
      .end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
  })

  it('It should get all authors', (done) => {
    chai.request(app)
      .get('/api/authors')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('name')
        res.body.data[0].should.have.property('is_alive')
        done()
      })
  })

  it('It should get a particular author', (done) => {
    const authorId = 1
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('name')
        res.body.data.should.have.property('is_alive')
        done()
      })
  })

  it('It should not get a particular author with invalid id', (done) => {
    const authorId = 8888
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Cannot find Author with the id ${authorId}`)
        done()
      })
  })

  it('It should not get a particular author with non-numeric id', (done) => {
    const authorId = 'aaa'
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message')
                            .eql('Please input a valid numeric value')
        done()
      })
  })

  it('It should update a author', (done) => {
    const authorId = 1
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.data.id).equal(updatedAuthor.id)
        expect(res.body.data.name).equal(updatedAuthor.name)
        expect(res.body.data.is_alive).equal(updatedAuthor.is_alive)
        done()
      })
  })

  it('It should not update a author with invalid id', (done) => {
    const authorId = '9999'
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author again',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Cannot find author with the id: ${authorId}`)
        done()
      })
  })

  it('It should not update a author with non-numeric id value', (done) => {
    const authorId = 'ggg'
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author again',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message')
                            .eql('Please input a valid numeric value')
        done()
      })
  })


  it('It should delete a author', (done) => {
    const authorId = 1
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.data).to.include({})
        done()
      })
  })

  it('It should not delete a author with invalid id', (done) => {
    const authorId = 777
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Author with the id ${authorId} cannot be found`)
        done()
      })
  })

  it('It should not delete a author with non-numeric id', (done) => {
    const authorId = 'bbb'
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message').eql('Please provide a numeric value')
        done()
      })
  })
})
