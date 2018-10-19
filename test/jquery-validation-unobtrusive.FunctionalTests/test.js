/// <include
const puppeteer = require('puppeteer');
const os = require("os");
const hostname = os.hostname();

// e.g., npm test --debug
// In debug mode we show the editor, slow down operations, and increase the timeout for each test
const debug = process.env.npm_config_debug || false;
jest.setTimeout(debug ? 60000 : 30000);

/** @type {puppeteer.Browser} */
let browser;
let error;

beforeAll(async () => {
    const options = debug ?
        { headless: false, slowMo: 100 } :
        { args: ['--no-sandbox'] };

    try {
        browser = await puppeteer.launch(options);
    } catch (ex) {
        error = ex;
    }
});

afterAll(async () => {
    if (browser) {
        await browser.close();
    }
});

describe('Browser is initialized', () => {
    // Workaround for https://github.com/jasmine/jasmine/issues/1533.
    // Jasmine will not report errors from beforeAll and instead fail all the tests that
    // expect the browser to be available. This test allows us to ensure the setup was successful
    // and if unsuccessful report the error
    test('no errors on launch', () => {
        expect(error).toBeUndefined();
        expect(browser).toBeDefined();
    });
});

describe('Client validation tests ', () => {
    const testPagePath = `http://${hostname}:9001/Validation/Index`;
    /** @type {puppeteer.Page} */
    let page;

    beforeAll(async () => {
        page = await browser.newPage();
    });

    test('Can load the page form', async () => {
        await page.goto(testPagePath);
        let result = await page.evaluate(() => {
            return document.getElementById('client-validation-form') ?
                true :
                false;
        });
        expect(result).toBeTruthy();
    });

    test('Required attribute works on string values', async () => {
        await page.goto(`${testPagePath}/Name`);
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Name');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Name-error',
                text: 'The Name field is required.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('MinLength attribute works on string values', async () => {
        await page.goto(`${testPagePath}/Name`);
        await page.focus('#Name');
        await page.keyboard.type('a');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Name');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Name-error',
                text: 'The field Name must be a string or array type with a minimum length of \'3\'.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Compare works on string values', async () => {
        await page.goto(`${testPagePath}/Password`);
        await page.focus('#Password');
        await page.keyboard.type('1234');
        await page.focus('#PasswordConfirmation');
        await page.keyboard.type('4321');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'PasswordConfirmation');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'PasswordConfirmation-error',
                text: "'PasswordConfirmation' and 'Password' do not match."
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Email address validates email inputs', async () => {
        await page.goto(`${testPagePath}/Email`);
        await page.focus('#Email');
        await page.keyboard.type('a');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Email');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Email-error',
                text: 'The Email field is not a valid e-mail address.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    // test('PhoneNumber validates phone number inputs', async () => {
    //     await page.goto(`${testPagePath}/PhoneNumber`);
    //     await page.focus('#PhoneNumber');
    //     await page.keyboard.type('a');
    //     await page.click('#regular-submit');
    //     let errorInfo = await page.evaluate(evaluateProperty, 'PhoneNumber');

    //     expect(errorInfo).toEqual({
    //         container: {
    //             found: true,
    //             class: 'field-validation-error'
    //         },
    //         message: {
    //             found: true,
    //             id: 'PhoneNumber-error',
    //             text: 'The PhoneNumber field is not a valid phone number.'
    //         },
    //         input: {
    //             found: true,
    //             class: 'form-control input-validation-error'
    //         }
    //     });
    // });

    // test('Creditcard validates credit card inputs', async () => {
    //     await page.goto(`${testPagePath}/Creditcard`);
    //     await page.focus('#Creditcard');
    //     await page.keyboard.type('a');
    //     await page.click('#regular-submit');
    //     let errorInfo = await page.evaluate(evaluateProperty, 'Creditcard');

    //     expect(errorInfo).toEqual({
    //         container: {
    //             found: true,
    //             class: 'field-validation-error'
    //         },
    //         message: {
    //             found: true,
    //             id: 'Creditcard-error',
    //             text: 'The Creditcard field is not a valid credit card number.'
    //         },
    //         input: {
    //             found: true,
    //             class: 'form-control input-validation-error'
    //         }
    //     });
    // });

    test('Range validates integer inputs are in range', async () => {
        await page.goto(`${testPagePath}/Age`);
        await page.focus('#Age');
        await page.keyboard.type('15');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Age');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Age-error',
                text: 'The field Age must be between 18 and 99.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Range validates floating-point inputs are in range', async () => {
        await page.goto(`${testPagePath}/Rating`);
        await page.focus('#Rating');
        await page.keyboard.type('15');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Rating');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Rating-error',
                text: 'The field Rating must be between 1 and 5.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('StringLength validates that the string input has the specified minimum length', async () => {
        await page.goto(`${testPagePath}/Tag`);
        await page.focus('#Tag');
        await page.keyboard.type('web.');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Tag');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Tag-error',
                text: 'The field Tag must be a string with a minimum length of 8 and a maximum length of 15.'
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('RegularExpression validates that the string input matched the specified regular expression', async () => {
        await page.goto(`${testPagePath}/Tag`);
        await page.focus('#Tag');
        await page.keyboard.type('somethingelse');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Tag');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Tag-error',
                text: "The field Tag must match the regular expression 'web\\..*'."
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Url validates that the string input is a valid url', async () => {
        await page.goto(`${testPagePath}/WebPage`);
        await page.focus('#WebPage');
        await page.keyboard.type('1234');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'WebPage');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'WebPage-error',
                text: "The WebPage field is not a valid fully-qualified http, https, or ftp URL."
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Remote validates the input calling the appropriate action for string values', async () => {
        await page.goto(`${testPagePath}/UserName`);
        await page.focus('#UserName');
        await page.keyboard.type('b');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'UserName');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'UserName-error',
                text: "'UserName' is invalid."
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });

    test('Remote validates the input calling the appropriate action for integer values', async () => {
        await page.goto(`${testPagePath}/Likes`);
        await page.focus('#Likes');
        await page.keyboard.type('-1');
        await page.click('#regular-submit');
        let errorInfo = await page.evaluate(evaluateProperty, 'Likes');

        expect(errorInfo).toEqual({
            container: {
                found: true,
                class: 'field-validation-error'
            },
            message: {
                found: true,
                id: 'Likes-error',
                text: "'Likes' is invalid."
            },
            input: {
                found: true,
                class: 'form-control input-validation-error'
            }
        });
    });
});

function evaluateProperty(property) {
    let input = document.getElementById(property);
    let containerSelector = `[data-valmsg-for=${property}]`;
    let container = document.querySelector(containerSelector);
    let containerClass = container && container.className;
    let messageContainer = container && container.querySelector(':first-child');
    let messageText = messageContainer && messageContainer.innerText;
    return {
        container: {
            found: container !== null,
            class: containerClass
        },
        message: {
            found: messageContainer !== null,
            id: messageContainer && messageContainer.id,
            text: messageText
        },
        input: {
            found: !!input,
            class: input && input.className
        }
    };
}