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