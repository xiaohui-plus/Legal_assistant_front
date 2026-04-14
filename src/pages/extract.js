// 提取JavaScript代码的脚�?const fs = require('fs');
const path = require('path');

// 读取HTML文件
const htmlPath = path.join(__dirname, 'evidence-analysis.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 提取所有脚本块
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let scriptBlocks = [];

while ((match = scriptRegex.exec(htmlContent)) !== null) {
    scriptBlocks.push(match[1]);
}

console.log(`找到 ${scriptBlocks.length} 个脚本块`);

// 将脚本块写入文件
scriptBlocks.forEach((block, index) => {
    const jsPath = path.join(__dirname, `script_${index + 1}.js`);
    fs.writeFileSync(jsPath, block);
    console.log(`已写入脚本块 ${index + 1} �?${jsPath}`);
});

// 检查脚本块的语�?scriptBlocks.forEach((block, index) => {
    console.log(`\n检查脚本块 ${index + 1}:`);
    try {
        new Function(block);
        console.log('  �?语法正确');
    } catch (error) {
        console.log(`  �?语法错误: ${error.message}`);
    }
});
