var specHelper = require('./spec_helper.js');

describe('GoKibitz front page', function() {
	it('displays information to an un-logged-in user', function() {
		var body = element(by.css('body')),
				logInButton = element(by.cssContainingText('a', 'Log In')),
				signUpButton = element(by.cssContainingText('a', 'Sign Up'));

		browser.get(browser.baseUrl);
		browser.waitForAngular();

		expect(browser.getTitle())
			.to.eventually.contain('GoKibitz: Move-by-move');

		expect(body.getText())
			.to.eventually.contain('Move-by-move conversations about go games.');

		expect(logInButton.isPresent()).to.eventually.eq(true);

		expect(signUpButton.isPresent()).to.eventually.eq(true);
	});
});
