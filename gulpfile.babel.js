import gulp from 'gulp';
import gulpBabel from 'gulp-babel';
import del from 'del';
import { exec } from 'child_process';

const copyBabel = () => {
	return gulp
		.src(['src/**/*.js', '!src/__*__/**/*.*'])
		.pipe(
			gulpBabel({
				presets: [
					[
						'google-apps-script',
						{
							modules: false,
						},
					],
				],
			})
		)
		.pipe(gulp.dest('build'));
};

const copyNonBabel = () => {
	return gulp
		.src(['src/**/*.*', '!src/**/*.js', '!src/__*__/**/*.*'])
		.pipe(gulp.dest('build'));
};

const cleanTheBuildFolder = (done) => {
	del(['build'], { dot: true }).then(() => {
		done();
	});
};

const pushToGAS = (done) => {
	exec('npx clasp push', (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
};

export const clean = cleanTheBuildFolder;
export const babel = copyBabel;
export const push = pushToGAS;
export const buildLocal = gulp.series(
	cleanTheBuildFolder,
	gulp.parallel(copyBabel, copyNonBabel)
);
export const build = gulp.series(buildLocal, pushToGAS);
