import express, { static as ExpressStatic } from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import { connect } from 'mongoose';

const app = express();
const port = 3000;
const apiVersion = '/v1';

connect('mongodb://localhost/postlinkdb')
	.then(() => {
		console.log('connected to database!');
	})
	.catch((e) => {
		console.log('connection failed!');
		console.error(e);
	});

app.use(
	cors({
		origin: ['http://localhost:4200'],
	})
);
app.use(json());
app.use(urlencoded({ extended: false }));

//allowed to enter /images folder
app.use('/images', ExpressStatic('images'));
//allowed to enter /cvs folder
app.use('/cvs', ExpressStatic('cvs'));

//for debugging only
import { deleteMany, find } from './models/User';
import { deleteMany as _deleteMany, find as _find } from './models/Employer';
import { deleteMany as __deleteMany, find as __find } from './models/Jobpost';
import { deleteMany as ___deleteMany } from './models/JobApplication';

app.use('/clearall', async (_req, res) => {
	await deleteMany({});
	await _deleteMany({});
	await __deleteMany({});
	await ___deleteMany({});
	res.status(200).json({
		message: 'cleared all',
	});
});
app.use('/getall', async (req, res) => {
	const users = await find({});
	const employers = await _find({});
	const jobs = await __find({});
	res.status(200).json({
		users: users,
		employers,
		employers,
		jobs: jobs,
	});
});
// ----------------- TEST -----------------
import swaggerRoutes from './routes/swaggerRoutes';
swaggerRoutes(app);
//-----------------------------------------

import jobPostRoutesRouter from './routes/jobpostRoutes';
import authRoutesRouter from './routes/authRoutes';
import employerRoutesRouter from './routes/employerRoutes';
import userRoutesRouter from './routes/userRoutes';
app.use(apiVersion, jobPostRoutesRouter);
app.use(apiVersion, authRoutesRouter);
app.use(apiVersion, employerRoutesRouter);
app.use(apiVersion, userRoutesRouter);

app.listen(port, () => console.log(`server listening on port: ${port}`));
