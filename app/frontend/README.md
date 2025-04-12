# Using React 18.3.0

First, create project :
    - In terminal: npm create vite@latest
    - Choose the name for project and package (example: Stock-Market)
    - Choose framework React, then choose JavaScript only 

Secondly, change to the dir of the project:
    - In terminal: cd Stock-Market
    - Then: npm install 

After the folder 'node_modules', delete React 19.0:
    - npm uninstall react react-dom
    - npm install react@18.3.0 react-dom@18.3.0 react-router-dom@6.22.0

Check the React version using 'npm list react', the true output is:
    react@18.3.0
    react-dom@18.3.0
    react-router-dom@6.22.0

Remember to change the "dependencies" in file 'package.json':
from: 
"dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.0"
}

to: 
"dependencies": {
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "react-router-dom": "6.22.0"
}


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
