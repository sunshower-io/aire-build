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
            environment {
                CURRENT_VERSION = sh "echo \$(npm list --depth=0 | grep aire-build | cut -d \" \" -f 1 | cut -d \"@\" -f 3)"
            }
            when {
                branch 'master'
                expression {
                    env.SKIP_BUILD == "false"
                }
            }

            stages {
                stage('Build and Deploy Release POMs') {


                    steps {
                        /**
                         * Set Git Config
                         */

                        sh "git config user.name '$GITHUB_USR'"
                        sh "git config user.email '${GITHUB_USR}@sunshower.io'"
                        sh "git remote set-url origin https://${GITHUB_USR}:${GITHUB_PSW}@github.com/sunshower-io/aire-build"

                        /**
                         * release
                         */
                        sh "npm version patch"

                        sh "npm publish --access=public"

                        /**
                         * Extract Environment Variables
                         */
                        extractVersions(version: env.CURRENT_VERSION)


                        /**
                         * Tag build
                         */
                        sh "git tag -af v${env.NEXT_VERSION} -m 'Releasing ${env.NEXT_VERSION} [skip-build]'"


                        /**
                         * Push tag
                         */
                        sh "git push origin v${env.NEXT_VERSION}"


                        sh "git commit -am 'Releasing ${env.NEXT_VERSION} [skip-build]'"
                        sh "git push -u origin HEAD:master"

                    }
                }
            }
        }
    }
}
