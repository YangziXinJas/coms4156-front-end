describe('no login visit spec', () => {
  it('visits login page', () => {
    cy.visit('/login')
  })

  it('cannot visit client page without logging in', () =>{
    cy.visit('/client').url().should('match', /login/)
  })

  it('cannot visit search page without logging in', () =>{
    cy.visit('/search').url().should('match', /login/)
  })

  it('cannot visit location page without logging in', () => {
    cy.visit('/location/1').url().should('match', /login/)
  })

  it('cannot visit order page without logging in', () => {
    cy.visit('/client/order/1').url().should('match', /login/)
  })
})

describe('test login', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('login with correct credentials', () => {
    it('takes user to client page', () => {
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('test4@outlook.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button').click()
      })

      cy.url().should('match', /client/)
    })
  })

  describe('login with incorrect credentials', () => {
    it('show alert with correct info', () => {
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('test4@outlook.com')
        cy.get('input[id=password]').type('cxs')
        cy.get('button').click()
        cy.on('window:alert', (txt) => {
          expect(txt).to.equal("Incorrect password")
        })
      })
    })
  })

  describe('login to an unregistered account', () => {
    it('show alert with correct info', () => {
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('test0@outlook.com')
        cy.get('input[id=password]').type('cxs')
        cy.get('button').click()
        cy.on('window:alert', (txt) => {
          expect(txt).to.equal("Client not found")
        })
      })
    })
  })
})

describe('test register', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('register with existing email inputs', () => {
    it('show correct alert', () => {
      cy.get('form[name=register-form]').within(() => {
        cy.get('input[id=email]').type('test10@gmail.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button[type=submit]').click()
        cy.on('window:alert', (txt) => {
          expect(txt).to.equal("Client already exists")
        })
      })
    })
  })

  describe('register with invalid inputs', () => {
    it('show correct alert when email is invalid', () => {
      cy.get('form[name=register-form]').within(() => {
        cy.get('input[id=email]').type('test10@gmail')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button[type=submit]').click()
        cy.on('window:alert', (txt) => {
          expect(txt).to.equal("Invalid email format")
        })
      })
    })

    it('show correct alert when password is invalid', () => {
      cy.get('form[name=register-form]').within(() => {
        cy.get('input[id=email]').type('test99@gmail.com')
        cy.get('input[id=password]').type('a1')
        cy.get('button[type=submit]').click()
        cy.on('window:alert', (txt) => {
          expect(txt).to.equal("Password must contain at least 8 characters, one letter, and one number")
        })
      })
    })
  })
})