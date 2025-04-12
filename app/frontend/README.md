# Using React 18.3.0

1. Create project :
- In terminal: npm create vite@latest
- Choose the name for project and package (example: Stock-Market)
- Choose framework React, then choose JavaScript only 

2. Change to the dir of the project:
    ```bash
    cd Stock-Market # name project
    npm install
    ```

3. After the folder `node_modules` create, delete React 19.0:
    ```bash
    npm uninstall react react-dom
    npm install react@18.3.0 react-dom@18.3.0 react-router-dom@6.22.0
    ```

4. Check the React version using 'npm list react', the true output is:
    ```perl
    react@18.3.0
    react-dom@18.3.0
    react-router-dom@6.22.0 
    ```

5. Remember to change the "dependencies" in file 'package.json':
from: 
```bash
"dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.0"
}
```

to: 
```bash
- "dependencies": {
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "react-router-dom": "6.22.0"
}
```


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
