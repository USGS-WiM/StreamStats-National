# StreamStats National

[![build status](https://github.com/USGS-WiM/StreamStats-National/workflows/Build/badge.svg)](https://github.com/coryrylan/angular-github-actions/actions) [![GitHub Super-Linter](https://github.com/USGS-WiM/StreamStats-National/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)

![WiM](wim.png)

Nationwide StreamStats application using NLDI services

## Prerequisites

[Node](https://nodejs.org/en/), [NPM](https://www.npmjs.com/), [Angular CLI](https://cli.angular.io/)

```bash
npm install -g @angular/cli
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Clone the repo and `cd` to that directory

install dependencies:

```bash
npm install
```

### Dev server

Serve application with live reload change detection:

```bash
ng serve
```

### Building and testing

to build a distribution folder for production:

```bash
ng build --prod --base-href "[relative path to web server root]"
```

to execute the unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

### Development Workflow

**Instructions below are for developers actively working on the repo**

An issue will be assigned to you via Github. Your workflow begins after assignment:

1. Create a branch with the issue number as the branch name (e.g. `134`)
2. Move issue into 'In Progress' column of project board
3. Do the work
    - While you work, you may wish to have the app running with live reload. Run `ng serve` to do so.
4. Write tests for the work
    - This is a critical step. StreamStats-National uses the [Jasmine library](https://jasmine.github.io/) for unit testing. Please refer there for docs and examples. Also refer to the [Angular testing guide](https://angular.io/guide/testing).
5. Run the tests to be sure they all pass and that the overall thresholds are met: `ng test`
6. Be sure the app runs in the browser without errors: `ng serve`
7. Ensure the app builds without error: `ng build`
    - If any of the checks above fail, please fix the issue. Ask for help if needed.
8. Once all checks have passed and you are ready to submit a Pull Request, update the changelog with a brief description of what your work added, changed, or fixed. There is an Unreleased section at top with subheadings for each category. Edit the file CHANGELOG.md found at project root.
9. Add the changed files `git add .` and commit `git commit -m '[your commit message here]'` you commit message should reference the issue number and include a very brief description of the work.
10. **Pull from `dev`**
    - Run `git pull origin dev`. This is a critical step. It ensures your Pull Request is synced with the latest work in the main `dev` branch. If you are lucky, it will auto-merge. Otherwise, you may have to resolve conflicts between your commit and what currently exists in dev. Please be careful with this step so no code is lost - ask for help if you are unsure what to do.
    - If manually merging, you will have changed files so you will need to add and commit once more (see step 9).
11. Push your committed and synced branch to the remote repo (Github): `git push origin [your branch name]`
12. Submit Pull Request (PR) to merge your issue branch into `dev`
    - Automated checks will be run against your PR. Failure of any of these will mean you need to re-commit to your branch to update your PR with the fix. A colleague will review your work and either approve it or request changes. Upon approval of the PR your issue will be automatically moved to the 'In Dev Branch' column of the project board.

Move onto next assigned issue and start back at step 1.

**Work will be merged with Master when sprint is complete for a release.**

### Deployment

TBD

## Built With

-   [Angular](https://angular.io/) - The main web framework used
-   [NPM](https://www.npmjs.com/) - Dependency Management

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on adhering by the [USGS Code of Scientific Conduct](https://www2.usgs.gov/fsp/fsp_code_of_scientific_conduct.asp).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](../../tags).

## Changelog

All developers must maintain the Changelog located at root as CHANGELOG.md. This document serves as a portable history of changes to the codebase and is meant to complement Github release tags. 'Added', 'Changed', and 'Fixed' sections should be updated within the Unreleased header when creating a Pull Request. As releases are created, those sections will move down into respective release headers.

## Authors

Katrin Jacobsen - _Lead Developer_ - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)

See also the list of [contributors](../../graphs/contributors) who participated in this project.

## License

This project is licensed under the Creative Commons CC0 1.0 Universal License - see the [LICENSE.md](LICENSE.md) file for details

## Suggested Citation

In the spirit of open source, please cite any re-use of the source code stored in this repository. Below is the suggested citation:

`This project contains code produced by the Web Informatics and Mapping (WIM) team at the United States Geological Survey (USGS). As a work of the United States Government, this project is in the public domain within the United States. https://wim.usgs.gov`

## Acknowledgments

## About WIM

-   This project authored by the [USGS WIM team](https://wim.usgs.gov)
-   WIM is a team of developers and technologists who build and manage tools, software, web services, and databases to support USGS science and other federal government cooperators.
-   WIM is a part of the [Upper Midwest Water Science Center](https://www.usgs.gov/centers/wisconsin-water-science-center).
