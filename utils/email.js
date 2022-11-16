const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
	const {
		EMAIL_HOST,
		EMAIL_PORT,
		EMAIL_USERNAME,
		EMAIL_PASSWORD
	} = process.env;

	const {
		email,
		subject,
		message
	} = options;

	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: EMAIL_HOST,
		port: EMAIL_PORT,
		auth: {
			user: EMAIL_USERNAME,
			pass: EMAIL_PASSWORD
		}
		// service: 'Gmail',
		// also if using gmail, activate 'last secure app' option
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Kenneth Man <kennethwaikinman@gmail.com>',
		to: email,
		subject: subject,
		text: message
		// html:
	}

	// 3) Send the email
	await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
