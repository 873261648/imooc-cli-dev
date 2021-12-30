'use strict';

const init = (projectName, {Force:force}) => {
    console.log(projectName, force, process.env.CLI_TARGET_PATH)
}

module.exports = init;
