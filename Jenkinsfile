pipeline {
    environment {
        MVN_REPO = credentials('artifacts-credentials')
        GITHUB = credentials('github-build-credentials')
        NPM = credentials('npm-credentials')
        NPM_DETAILS = credentials('npm-details')
    }
    agent {
        docker {
            image 'sunshower/ui-image:1.0.0'
            args "-u 1000 --privileged"
        }
    }

    stages {
        stage('Check Commit Message for Skip Condition') {
            steps {
                skipRelease action: 'check', forceAbort: false
            }
        }

        stage('Build and increment') {
            steps {
                sh "npm install"
                sh """
                    npx jest
                    """

            }
        }

        stage('POMs') {
            when {
                branch 'master'
                expression {
                    env.SKIP_BUILD == "false"
                }
            }

            stages {
                stage('Build and Deploy Release POMs') {


                    steps {
                        sh "git tag -d \$(git tag -l)"
                        /**
                         * Set Git Config
                         */

                        sh "git config user.name '$GITHUB_USR'"
                        sh "git config user.email '${GITHUB_USR}@sunshower.io'"
                        sh "git remote set-url origin https://${GITHUB_USR}:${GITHUB_PSW}@github.com/sunshower-io/aire-build"

                        sh "npm-login-noninteractive -u ${NPM_USR} -p ${NPM_PSW} -e ${NPM_DETAILS_USR} "
                        /**
                         * release
                         */
                        sh "git checkout -b tmp"
                        sh "npm version patch --force -m 'releasing [skip-build]'"

                        sh "npm publish --access=public"

                        /**
                         *
                         */

                        sh "git checkout master"
                        sh "git branch --set-upstream-to=origin/master master"
                        sh "git merge tmp"
                        sh "git commit -am 'releasing [skip-build]'"
                        sh "git branch -d tmp"

                        /**
                         * push
                         */
                        sh "git push -u origin HEAD:master"

                    }
                }
            }
        }
    }
}
