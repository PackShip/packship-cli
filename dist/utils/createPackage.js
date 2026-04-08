import fs from "fs";
import path from "path";
import { renderTemplate } from "./fileUtils.js";
import { text, select, confirm } from "@clack/prompts";
import { registerHandlebarsHelpers } from "./handlebarsHelpers.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Register the missing Handlebars helper
registerHandlebarsHelpers();
export async function createPackage() {
    console.log("\n\x1b[36m%s\x1b[0m", "📦 PackShip - Package Initialization");
    console.log("\x1b[90m%s\x1b[0m", "Let's set up your new package...\n");
    // Get basic information about the package
    const name = await text({
        message: "What is the name of your package?",
        validate: (value) => (/^(?:@[a-zA-Z0-9-*~]+\/)?[a-zA-Z0-9-~]+$/.test(value) ? undefined : "Invalid package name. Follow npm naming conventions.")
    });
    const description = await text({
        message: "Provide a description for your package:"
    });
    // Choose the language
    const languageChoice = await select({
        message: "Which language do you want to use for your project?",
        options: [
            { value: "TypeScript", label: "TypeScript" },
            { value: "JavaScript", label: "JavaScript" }
        ],
        initialValue: "TypeScript"
    });
    // Filter project types based on the selected language
    const projectOptions = languageChoice === "TypeScript"
        ? [
            { value: "react-ts", label: "React (with TypeScript)" },
            { value: "node-ts", label: "Node.js (with TypeScript)" }
        ]
        : [
            { value: "react-js", label: "React (with JavaScript)" },
            { value: "node-js", label: "Node.js (with JavaScript)" },
            { value: "vanilla-js", label: "Vanilla JavaScript" }
        ];
    // Choose the project type
    const projectType = await select({
        message: "What type of project are you creating?",
        options: projectOptions,
        initialValue: projectOptions[0].value
    });
    // Get author information
    const authorName = await text({
        message: "Author name:",
        validate: (value) => (value ? undefined : "Author name is required.")
    });
    const authorEmail = await text({
        message: "Author email:",
        validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Please enter a valid email address.")
    });
    // Include internal directory if needed
    const includeInternalDir = await confirm({
        message: "Will your project have internal-use components that need an `internal` directory?",
        initialValue: true
    });
    // Additional choices for tooling and configuration
    const useWebpack = await confirm({
        message: "Do you need to bundle your code using Webpack?",
        initialValue: true
    });
    const useEslint = await confirm({
        message: "Do you want to enforce coding standards with ESLint?",
        initialValue: true
    });
    const usePostcss = await confirm({
        message: "Will your project involve processing CSS (e.g., adding vendor prefixes)?",
        initialValue: true
    });
    const useNpmignore = await confirm({
        message: "Do you need to specify files to exclude from your npm package with a .npmignore file?",
        initialValue: true
    });
    const includeLicense = await confirm({
        message: "Do you want to include a LICENSE file for your project?",
        initialValue: true
    });
    let licenseType = "MIT";
    if (includeLicense) {
        const licenseSelection = await select({
            message: "What type of license would you like to include?",
            options: [
                { value: "MIT", label: "MIT" },
                { value: "ISC", label: "ISC" },
                { value: "Apache-2.0", label: "Apache-2.0" },
                { value: "GPL-3.0", label: "GPL-3.0" }
            ],
            initialValue: "MIT"
        });
        licenseType = String(licenseSelection);
    }
    const includeCodeOfConduct = await confirm({
        message: "Do you want to include a CODE_OF_CONDUCT.md file for community guidelines?",
        initialValue: true
    });
    const includeReadme = await confirm({
        message: "Would you like to include a README.md file to describe your project?",
        initialValue: true
    });
    // Define base package.json data
    let packageData = {
        name: String(name),
        version: "0.1.0",
        description: String(description),
        language: String(languageChoice),
        projectType: String(projectType),
        main: languageChoice === "JavaScript" ? "index.js" : "dist/index.js",
        module: languageChoice === "JavaScript" ? "index.mjs" : "dist/index.mjs",
        type: typeof projectType === "string" && projectType.startsWith("node-") ? "commonjs" : "module",
        scripts: {
            test: "echo 'Error: no test specified' && exit 1",
            "packship:publish": "packship publish",
        },
        keywords: [],
        author: {
            name: String(authorName),
            email: String(authorEmail)
        },
        license: String(licenseType),
        _packshipInitialized: true
    };
    // Dynamically adjust package.json fields based on user choices
    if (typeof projectType === "string" && projectType.startsWith("react-")) {
        packageData = {
            ...packageData,
            peerDependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0"
            },
            devDependencies: {
                "@babel/cli": "^7.10.5",
                "@babel/core": "^7.23.9",
                "@babel/preset-env": "^7.23.9",
                "@babel/preset-react": "^7.23.3"
            },
            scripts: {
                ...packageData.scripts,
                "build-babel": "babel src --out-dir dist --presets=@babel/preset-react,@babel/preset-env",
                build: languageChoice === "JavaScript" ? "npm run build-babel" : "tsc && npm run build-babel"
            }
        };
        if (languageChoice === "TypeScript") {
            packageData.devDependencies = {
                ...packageData.devDependencies,
                "@babel/preset-typescript": "^7.24.7",
                "@types/react": "^18.3.3",
                "@types/react-dom": "^18.3.0",
                "ts-loader": "^9.5.1",
                typescript: "^4.9.5"
            };
            if (packageData.scripts) {
                packageData.scripts.build = "tsc && npm run build-babel";
            }
        }
    }
    if (useWebpack && packageData.scripts) {
        packageData.devDependencies = {
            ...packageData.devDependencies,
            webpack: "^5.0.0",
            "webpack-cli": "^5.1.4",
        };
        packageData.scripts["build-webpack"] = "webpack --config webpack.config.js";
        if (packageData.scripts.build) {
            packageData.scripts.build += " && npm run build-webpack";
        }
        else {
            packageData.scripts.build = "npm run build-webpack";
        }
    }
    // Add a basic build script for JavaScript projects when webpack is not selected
    // Note: React projects already have a build script from the React-specific section above
    if (!useWebpack && languageChoice === "JavaScript" &&
        typeof projectType === "string" &&
        (projectType === "vanilla-js" || projectType === "node-js") &&
        packageData.scripts && !packageData.scripts.build) {
        packageData.scripts.build = "mkdir -p dist && cp src/index.js dist/";
    }
    if (useEslint && packageData.scripts) {
        packageData.devDependencies = {
            ...packageData.devDependencies,
            eslint: "^7.32.0",
            "eslint-plugin-react": "^7.24.0"
        };
        if (languageChoice === "TypeScript") {
            packageData.devDependencies = {
                ...packageData.devDependencies,
                "@typescript-eslint/eslint-plugin": "^5.0.0",
                "@typescript-eslint/parser": "^5.0.0"
            };
        }
        packageData.scripts.lint = "eslint .";
    }
    // Adjust dependencies based on other choices like PostCSS, etc.
    if (usePostcss) {
        packageData.devDependencies = {
            ...packageData.devDependencies,
            autoprefixer: "^10.3.1",
            postcss: "^8.4.5"
        };
    }
    // Create the package directory
    const packageDir = path.join(process.cwd(), String(name));
    if (fs.existsSync(packageDir)) {
        console.error("\n\x1b[31m%s\x1b[0m", `Error: Directory ${String(name)} already exists.`);
        throw new Error(`Directory ${String(name)} already exists.`);
    }
    // Create the package directory
    fs.mkdirSync(packageDir, { recursive: true });
    // Get the template directory
    const templateDir = path.resolve(__dirname, '../../templates');
    console.log(`\n\x1b[90m%s\x1b[0m`, `Using template directory: ${templateDir}`);
    // Check if the template directory exists
    if (!fs.existsSync(templateDir)) {
        console.error(`\n\x1b[31m%s\x1b[0m`, `Template directory not found: ${templateDir}`);
        throw new Error(`Template directory not found: ${templateDir}`);
    }
    // Define files to generate based on user choices
    const files = [
        { name: "package.json", template: "package.json.hbs", data: { name, description } },
        { name: ".packshiprc", template: "packshiprc.hbs", data: { initialized: true, version: "0.1.0" } },
        { name: "assets/icons/packshiprc.svg", template: "assets/icons/packshiprc-32.svg", data: {} },
        { name: "assets/icons/packshiprc-32.svg", template: "assets/icons/packshiprc-32.svg", data: {} },
        { name: "assets/icons/README.md", template: "assets/icons/README.md.hbs", data: {} },
        { name: "assets/icons/vscode-settings-example.json", template: "assets/icons/vscode-settings-example.json.hbs", data: { name } },
        ...(includeReadme ? [{ name: "README.md", template: "README.md.hbs", data: { name, description, licenseType } }] : []),
        { name: ".gitignore", template: ".gitignore.hbs", data: {} },
        ...(useNpmignore ? [{ name: ".npmignore", template: ".npmignore.hbs", data: {} }] : []),
        // Check if it's a React project
        ...(typeof projectType === "string" && projectType.startsWith("react-")
            ? (languageChoice === "JavaScript"
                ? [{ name: "src/index.jsx", template: "index.jsx.hbs", data: {} }] // React with JavaScript
                : [
                    { name: "src/index.tsx", template: "index.tsx.hbs", data: {} }, // React with TypeScript
                    { name: "types/index.ts", template: "index.ts.hbs", data: {} },
                    { name: "src/declaration.d.ts", template: "declaration.d.ts.hbs", data: {} }
                ])
            : (languageChoice === "JavaScript"
                ? [{ name: "src/index.js", template: "index.js.hbs", data: {} }] // Non-React with JavaScript
                : [
                    { name: "src/index.ts", template: "index.ts.hbs", data: {} }, // Non-React with TypeScript
                    { name: "types/index.ts", template: "index.ts.hbs", data: {} },
                    { name: "src/declaration.d.ts", template: "declaration.d.ts.hbs", data: {} }
                ])),
        ...(includeInternalDir
            ? (typeof projectType === "string" && projectType.startsWith("react-")
                ? (languageChoice === "JavaScript"
                    ? [{ name: "src/internal/index.jsx", template: "index.jsx.hbs", data: {} }]
                    : [{ name: "src/internal/index.tsx", template: "index.tsx.hbs", data: {} }])
                : (languageChoice === "JavaScript"
                    ? [{ name: "src/internal/index.js", template: "index.js.hbs", data: {} }]
                    : [{ name: "src/internal/index.ts", template: "index.ts.hbs", data: {} }]))
            : []),
        ...(usePostcss
            ? [
                { name: "postcss.config.js", template: "postcss.config.hbs", data: {} },
                { name: "styles/style.css", template: "style.css.hbs", data: {} }
            ]
            : []),
        ...(includeLicense ? [{ name: "LICENSE.md", template: "LICENSE.md.hbs", data: { name, licenseType } }] : []),
        ...(includeCodeOfConduct ? [{ name: "CODE_OF_CONDUCT.md", template: "CODE_OF_CONDUCT.md.hbs", data: { name } }] : []),
        ...(useEslint ? [{ name: ".eslintrc.json", template: "eslintrc.json.hbs", data: {} }] : []),
        ...(useWebpack ? [{ name: "webpack.config.js", template: "webpack.config.hbs", data: { libraryName: name } }] : []),
        // Add Babel config if it's a React project
        ...(typeof projectType === "string" && projectType.startsWith("react-")
            ? [{ name: "babel.config.json", template: "babel.config.hbs", data: {} }]
            : []),
        // Add tsconfig.json if language choice is TypeScript
        ...(languageChoice === "TypeScript" ? [{ name: "tsconfig.json", template: "tsconfig.json.hbs", data: {} }] : [])
    ];
    // Generate each file using its corresponding template
    for (const { name: fileName, template, data } of files) {
        const filePath = path.join(packageDir, fileName);
        // Ensure directory exists
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
        // Prepare data for template rendering
        const templateData = {
            ...packageData,
            ...data,
            name: typeof data.name === "symbol" ? String(data.name) : data.name,
            description: typeof data.description === "symbol" ? String(data.description) : data.description,
            licenseType: data.licenseType !== undefined ? (typeof data.licenseType === "symbol" ? String(data.licenseType) : data.licenseType) : licenseType
        };
        try {
            // Render template and write to file
            const templatePath = path.join(templateDir, template);
            if (!fs.existsSync(templatePath)) {
                console.warn(`\x1b[33m%s\x1b[0m`, `Warning: Template file not found: ${template}`);
                continue;
            }
            const content = renderTemplate(templatePath, templateData);
            fs.writeFileSync(filePath, content);
            console.log(`\x1b[32m%s\x1b[0m`, `Created: ${fileName}`);
        }
        catch (error) {
            console.error(`\x1b[31m%s\x1b[0m`, `Error creating ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    console.log("\n\x1b[32m%s\x1b[0m", "✅ Package setup completed successfully!");
    console.log("\x1b[36m%s\x1b[0m", `Your package is ready at: ${packageDir}`);
    console.log("\x1b[90m%s\x1b[0m", "To get started, run the following commands:");
    console.log("\x1b[90m%s\x1b[0m", `  cd ${String(name)}`);
    console.log("\x1b[90m%s\x1b[0m", "  npm install");
    console.log("\x1b[90m%s\x1b[0m", "  npm run build");
    return name;
}
