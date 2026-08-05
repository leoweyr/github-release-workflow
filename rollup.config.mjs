import { pathToFileURL } from 'node:url';

import { rollup } from 'rollup';


const actionBundleConfigurations = [
    // Add one configuration for each independently callable JavaScript Action.
];


async function bundleActions() {
    if (actionBundleConfigurations.length === 0) {
        console.log('No JavaScript Actions are configured for bundling.');
        return;
    }

    for (const actionBundleConfiguration of actionBundleConfigurations) {
        const { output, ...inputOptions } = actionBundleConfiguration;
        const actionBundle = await rollup(inputOptions);

        try {
            const outputConfigurations = Array.isArray(output) ? output : [output];

            for (const outputConfiguration of outputConfigurations) {
                await actionBundle.write(outputConfiguration);
            }
        } finally {
            await actionBundle.close();
        }
    }
}


const invokedFilePath = process.argv[1];

if (invokedFilePath !== undefined && import.meta.url === pathToFileURL(invokedFilePath).href) {
    await bundleActions();
}


export default actionBundleConfigurations;
