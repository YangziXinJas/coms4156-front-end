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

describe('client page tests', () => {
  describe('client is type retail', () => {
    beforeEach(() => {
      cy.visit('/login')
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('test4@outlook.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button').click()
      })
    })

    it('should take user to client page', ()=> {
      cy.url().should('match', /client/)
    })

    it('client page attributes should be correct', () => {
      cy.get('[id=client-id]').should('have.html','Client ID: 124')
      cy.get('[id=client-type]').should('have.html','Client Type: retail')
    })
  })

  describe('client is type warehouse', () => {
    beforeEach(() => {
      cy.visit('/login')
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('warehouse@outlook.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button').click()
      })
    })

    it('should take user to client page', ()=> {
      cy.url().should('match', /client/)
    })

    it('client page attributes should be correct', () => {
      cy.get('[id=client-id]').should('have.html', 'Client ID: 307')
      cy.get('[id=client-type]').should('have.html', 'Client Type: warehouse')
    })
  })

  describe('when client has no orders', () => {
    beforeEach(() => {
      cy.visit('/login')
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('warehouse@outlook.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button').click()
      })
    })

    it('order table should be empty and show correct message', () => {
      cy.get('td').should('have.html', 'You have not placed any order')
    })
  })

  describe('when client has orders', () => {
    beforeEach(() => {
      cy.visit('/login')
      cy.get('form[name=login-form]').within(() => {
        cy.get('input[id=email]').type('test4@outlook.com')
        cy.get('input[id=password]').type('a12345678')
        cy.get('button').click()
      })
    })

    it('order table should not be empty', () => {
      cy.get('tr').should('have.length', 3)
    })
  })
})

describe('order page tests', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('form[name=login-form]').within(() => {
      cy.get('input[id=email]').type('test4@outlook.com')
      cy.get('input[id=password]').type('a12345678')
      cy.get('button').click()
    })
    cy.get('tbody').within(() => {
      cy.get('tr').first().get('a').click()
    })
  })

  it('should be on order page', () => {
    cy.url().should('match', /client\/order\/[\d]/)
  })

  it('should have order number', () => {
    cy.get('h1').first().invoke('html').should('match', /Order Number #[\d]/)
  })

  it('should have order type', () => {
    cy.get('div').contains('Order Type: ').invoke('html').should('match',/Order Type: [buy|rent]/)
  })

  it('should have order date', () => {
    cy.get('div').contains('Order Date: ').invoke('html').should('match',/Order Date: [/^\d{4}-\d{2}-\d{2}$/]/)
  })

  it('should have correct', () => {
    const toStrings = (cells$) => Cypress._.map(cells$, 'textContent')
    const toNumbers = (texts) => Cypress._.map(texts, Number)
    const sum = (numbers) => Cypress._.sum(numbers)
    cy.get('thead').contains('Price').get('tbody').get("tr td:nth-child(2)").then(toStrings).then(toNumbers).then(sum).then(total => {
      cy.get('div').contains('Subtotal: ').invoke('html').should('eq', 'Subtotal: ' + total)
    })    
  })
})

describe('search page test', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('form[name=login-form]').within(() => {
      cy.get('input[id=email]').type('test4@outlook.com')
      cy.get('input[id=password]').type('a12345678')
      cy.get('button').click()
    })
    cy.url().should('match',/client/)
    cy.get('a').contains('Search').click()
    cy.url().should('match',/search/)
  })

  describe('search location', () => {
    it('takes to correct page', () => {
      cy.get('input[id=location-id]').type('2')
      cy.get('button').eq(0).click()
      cy.url().should('match', /location\/[\d]/)
    })

    describe('when location has items', () => {
      beforeEach(() => {
        cy.get('input[id=location-id]').type('2')
        cy.get('button').eq(0).click()
      })
      
      it('has a non-empty table', () => {
        cy.get('tbody > tr').should('not.be.empty')
      })
    })

    describe('when location has no items', () => {
      beforeEach(() => {
        cy.get('input[id=location-id]').type('1')
        cy.get('button').eq(0).click()
      })
      
      it('has an empty table', () => {
        cy.get('tbody > tr').should('have.length', 1)
        cy.get('tbody > tr > td').invoke('html').should('eq', 'There are not items in this location')
      })
    })
  })

  describe('search item', () => {
    it('takes to correct page', () => {
      cy.get('input[id=item-id]').type('1')
      cy.get('button').eq(1).click()
      cy.url().should('match', /search\/items\/[\d]/)
    })
  })
})

describe('ItemDetail E2E Tests', () => {
  const baseSearchUrl = '/search';
  beforeEach(() => {
    cy.visit('/login')
    cy.get('form[name=login-form]').within(() => {
      cy.get('input[id=email]').type('test4@outlook.com')
      cy.get('input[id=password]').type('a12345678')
      cy.get('button').click()
    });

    // Wait for the login process to complete and home page to load
    cy.url().should('include', '/client');

    // Navigate to the search page by clicking the navbar link
    cy.get('nav').contains('Search').click();
  });

  it('displays item details correctly', () => {
    cy.get('input[id="item-id"]').type("18");
    cy.get('#search-item-button').click();
    cy.get('h2').should('contain', 'spicy ramen');

    cy.get('.item-description').should('contain','spicy ramen noodles')

    cy.get('.item-price').should('contain', '$3');
    cy.get('.item-stock-level').should('contain', '8');

    cy.get('.related-Item').first().click();
    const relatedItemId = 19;
    cy.url().should('eq', 'http://localhost:3000/search/items/' + relatedItemId);
  });


  it('displays barcode image', () => {
    cy.get('.item-barcode').should('not.exist');
  });

});
