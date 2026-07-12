const fs = require('fs');
const files = ['css/style.css', 'css/careers.css', 'index.html'];
const rootVars = `\n:root {
    --primary: #0F172A;
    --accent: #06B6D4;
    --accent-hover: #00E5FF;
    --dark: #0B0F19;
    --surface-dark: #1E293B;
    --bg-light: #F8FAFC;
    --text-light: #F1F5F9;
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
}\n`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Add variables and replace fonts
    if (file.endsWith('.css') && !content.includes(':root')) {
        content = content.replace(/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins[^']+'\);/gi, 
            "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');" + rootVars);
    }
    content = content.replace(/Poppins/g, 'Plus Jakarta Sans');
    
    // Replace hex colors globally with variables
    content = content.replace(/#002e5f/gi, 'var(--primary)');
    content = content.replace(/#00bfff/gi, 'var(--accent)');
    content = content.replace(/#007bff/gi, 'var(--accent)');
    content = content.replace(/#333333/gi, 'var(--dark)');
    content = content.replace(/#333(?![0-9a-fA-F])/gi, 'var(--dark)');
    content = content.replace(/#222222/gi, 'var(--surface-dark)');
    content = content.replace(/#222(?![0-9a-fA-F])/gi, 'var(--surface-dark)');
    content = content.replace(/#f9f9f9/gi, 'var(--bg-light)');
    content = content.replace(/#f2f2f2/gi, 'var(--bg-light)');
    
    fs.writeFileSync(file, content);
});
console.log('Theme applied successfully!');
