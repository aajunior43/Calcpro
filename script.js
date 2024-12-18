// Variáveis globais
const display = document.getElementById('result');
const historyDisplay = document.getElementById('historyDisplay');
let lastResult = '';

// Efeitos de botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('button-press');
        setTimeout(() => button.classList.remove('button-press'), 200);
        
        // Efeito de onda
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    });
});

// Funções principais melhoradas
function appendValue(value) {
    if (display.value === '0' && value !== '.') {
        display.value = '';
    }
    
    // Formatação automática de operadores
    const lastChar = display.value.slice(-1);
    const operators = ['+', '-', '*', '/', '%'];
    
    if (operators.includes(value) && operators.includes(lastChar)) {
        display.value = display.value.slice(0, -1) + value;
    } else {
        display.value += value;
    }
    
    // Adicionar efeito glitch
    addGlitchEffect();
}

function clearDisplay() {
    display.value = '';
    display.classList.add('clear-effect');
    setTimeout(() => display.classList.remove('clear-effect'), 300);
}

function deleteLastChar() {
    display.value = display.value.slice(0, -1);
    display.classList.add('delete-effect');
    setTimeout(() => display.classList.remove('delete-effect'), 200);
}

function calculate() {
    try {
        let expression = display.value;
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        expression = expression.replace(/(\d+)%/g, (match, number) => number / 100);
        
        let result = eval(expression);
        
        if (!isFinite(result)) {
            throw new Error('Resultado inválido');
        }
        
        epicEqualEffect();
        
        setTimeout(() => {
            result = formatResult(result);
            display.value = result;
            
            // Efeito suave no resultado
            display.classList.add('display-surge');
            setTimeout(() => display.classList.remove('display-surge'), 500);
        }, 300);
        
    } catch (error) {
        showError();
    }
}

function showError() {
    display.value = 'Erro';
    display.style.animation = 'resultError 0.8s ease';
    setTimeout(() => {
        display.style.animation = '';
        clearDisplay();
    }, 800);
}

// Funções de utilidade
function formatResult(number) {
    if (Math.abs(number) < 1e-7 || Math.abs(number) > 1e10) {
        return number.toExponential(4);
    }
    return parseFloat(number.toFixed(8)).toString();
}

// Sistema de histórico e exportação
function addToHistory(expression, result) {
    calculationHistory.push({
        expression,
        result,
        timestamp: new Date().toLocaleString()
    });
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDisplay = document.getElementById('historyDisplay');
    if (calculationHistory.length > 0) {
        const lastCalc = calculationHistory[calculationHistory.length - 1];
        historyDisplay.textContent = `${lastCalc.expression} = ${lastCalc.result}`;
    }
}

// Funções de exportação
function copyToClipboard() {
    if (display.value === '') {
        showToast('Nenhum cálculo para copiar!');
        return;
    }
    
    navigator.clipboard.writeText(display.value)
        .then(() => showToast('Copiado para área de transferência!'))
        .catch(() => showToast('Erro ao copiar!'));
}

function exportToPDF() {
    if (display.value === '') {
        showToast('Nenhum cálculo para exportar!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cores refinadas
    const goldColor = '#D4AF37';
    const darkGold = '#B8860B';
    const lightGold = '#FFD700';
    
    // Background premium
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header premium com gradiente
    doc.setFillColor(parseInt(darkGold.substr(1,2), 16), 
                     parseInt(darkGold.substr(3,2), 16), 
                     parseInt(darkGold.substr(5,2), 16));
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo e branding
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(45);
    doc.text("CALCPRO", 105, 30, { 
        align: 'center',
        renderingMode: 'fillThenStroke',
        strokeWidth: 0.7
    });
    
    doc.setFontSize(12);
    doc.text("PROFESSIONAL CALCULATOR", 105, 40, { align: 'center' });
    
    // Área do cálculo
    doc.setDrawColor(parseInt(goldColor.substr(1,2), 16), 
                    parseInt(goldColor.substr(3,2), 16), 
                    parseInt(goldColor.substr(5,2), 16));
    doc.setLineWidth(1);
    doc.roundedRect(20, 70, 170, 100, 5, 5);
    
    // Separando expressão e resultado
    let expression = display.value;
    let lastOperatorIndex = Math.max(
        expression.lastIndexOf('+'),
        expression.lastIndexOf('-'),
        expression.lastIndexOf('*'),
        expression.lastIndexOf('/'),
        expression.lastIndexOf('%')
    );
    
    let calculation = expression;
    let result = eval(expression);
    
    // Título da seção
    doc.setTextColor(parseInt(goldColor.substr(1,2), 16), 
                    parseInt(goldColor.substr(3,2), 16), 
                    parseInt(goldColor.substr(5,2), 16));
    doc.setFontSize(20);
    doc.text("DETALHES DO CÁLCULO", 105, 85, { align: 'center' });
    
    // Linha separadora decorativa
    doc.setLineWidth(0.5);
    doc.line(35, 90, 175, 90);
    
    // Expressão do cálculo
    doc.setFontSize(16);
    doc.text("Expressão:", 35, 105);
    doc.setFontSize(24);
    doc.text(calculation.replace('*', '×').replace('/', '÷'), 105, 120, { align: 'center' });
    
    // Linha separadora
    doc.setLineWidth(0.3);
    doc.line(35, 130, 175, 130);
    
    // Resultado
    doc.setFontSize(16);
    doc.text("Resultado:", 35, 145);
    doc.setFontSize(28);
    doc.text(result.toString(), 105, 155, { 
        align: 'center',
        renderingMode: 'fillThenStroke',
        strokeWidth: 0.5
    });
    
    // Elementos decorativos nas bordas
    for(let i = 0; i < 4; i++) {
        const x = 20 + (i % 2) * 170;
        const y = 70 + Math.floor(i/2) * 100;
        
        // Cantos ornamentados
        doc.setLineWidth(0.5);
        doc.line(x, y, x + 15, y);
        doc.line(x, y, x, y + 15);
        doc.line(x + 170, y, x + 155, y);
        doc.line(x + 170, y, x + 170, y + 15);
    }
    
    // Informações adicionais
    doc.setFontSize(12);
    doc.roundedRect(20, 190, 170, 60, 3, 3);
    doc.text("Informações:", 35, 205);
    
    // Lista de características
    doc.setFontSize(10);
    const features = [
        "• Cálculo de alta precisão",
        "• Suporte a operações complexas",
        "• Formatação automática de resultados",
        "• Exportação profissional"
    ];
    
    features.forEach((feature, index) => {
        doc.text(feature, 40, 220 + (index * 10));
    });
    
    // Rodapé premium
    doc.setDrawColor(parseInt(goldColor.substr(1,2), 16), 
                    parseInt(goldColor.substr(3,2), 16), 
                    parseInt(goldColor.substr(5,2), 16));
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    
    // Assinatura e data
    doc.setFontSize(10);
    doc.text("Desenvolvido por", 40, 280);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Aleksandro Alves", 40, 288);
    
    // Data à direita
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString();
    doc.text(currentDate, 170, 288, { align: 'right' });
    
    // QR Code decorativo
    doc.setFillColor(parseInt(goldColor.substr(1,2), 16), 
                    parseInt(goldColor.substr(3,2), 16), 
                    parseInt(goldColor.substr(5,2), 16));
    doc.roundedRect(165, 275, 15, 15, 2, 2, 'F');
    
    doc.save('CALCPRO-calculo.pdf');
    showToast('PDF exportado com sucesso!');
}

function exportToTXT() {
    if (display.value === '') {
        showToast('Nenhum cálculo para exportar!');
        return;
    }

    const content = `Resultado: ${display.value}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculo.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('TXT exportado com sucesso!');
}

// Suporte ao teclado
function setupKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '%'];
        
        if (validKeys.includes(key)) {
            e.preventDefault();
            appendValue(key);
            addGlitchEffect();
        } else if (key === 'Enter') {
            e.preventDefault();
            calculate();
        } else if (key === 'Backspace') {
            e.preventDefault();
            deleteLastChar();
        } else if (key === 'Escape') {
            e.preventDefault();
            clearDisplay();
        }
    });
}

// Notificações
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2300);
}

// Adicionando novos efeitos
function addDistortionEffect(element) {
    element.classList.add('glitch');
    setTimeout(() => element.classList.remove('glitch'), 200);
}

// Adicionar efeito aos botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        const ripple = document.createElement('div');
        ripple.classList.add('cyberpunk-ripple');
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    });
});

// Efeito 3D na calculadora
const calculator = document.querySelector('.calculator');
document.addEventListener('mousemove', (e) => {
    const rect = calculator.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = y / rect.height * 10;
    const rotateY = -x / rect.width * 10;
    
    calculator.style.transform = `
        perspective(2000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
    `;
});

calculator.addEventListener('mouseleave', () => {
    calculator.style.transform = 'perspective(2000px) rotateX(0) rotateY(0)';
});

// Matrix Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-rain';
        document.querySelector('.container').appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.characters = '0123456789+-*/=%';
        this.drops = [];
        this.fontSize = 14;
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.initDrops();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.initDrops();
    }

    initDrops() {
        this.drops = Array(this.columns).fill(1);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for(let i = 0; i < this.drops.length; i++) {
            const char = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(char, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if(this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Digital Distortion Effect
function addDistortionEffect(element) {
    element.classList.add('glitch');
    setTimeout(() => element.classList.remove('glitch'), 200);
}

// Cyber Waves Effect
function createCyberWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'cyber-waves';
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    document.querySelector('.calculator').appendChild(wave);
    
    wave.style.animation = 'cyberWave 1s ease-out forwards';
    setTimeout(() => wave.remove(), 1000);
}

function addGlitchEffect() {
    display.classList.add('glitch-effect');
    display.setAttribute('data-text', display.value);
    display.classList.add('display-glitch');
    
    // Som de glitch (opcional)
    const glitchSound = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
    glitchSound.volume = 0.1;
    glitchSound.play();
    
    setTimeout(() => {
        display.classList.remove('glitch-effect');
        display.classList.remove('display-glitch');
    }, 300);
}

// Função para criar partículas de energia
function createEnergyParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        document.body.appendChild(particle);
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 2;
        const radius = Math.min(rect.width, rect.height) / 2;
        
        const startX = centerX;
        const startY = centerY;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        const animation = particle.animate([
            {
                transform: `translate(-50%, -50%) scale(1)`,
                opacity: 1
            },
            {
                transform: `translate(
                    ${Math.cos(angle) * radius * 2}px,
                    ${Math.sin(angle) * radius * 2}px
                ) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// Atualizar o evento de clique dos operadores
document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', (e) => {
        // Efeito visual
        button.classList.add('operator-effect');
        createEnergyParticles(button, e);
        
        // Som de energia (opcional)
        const energySound = new Audio('data:audio/wav;base64,UklGRn4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA7zO0zPMzMPTw9zM28PczMvD3MzLw9zMy8PczMvD3MzLw9zMy8PczMvD3MzLw9zMy8PczMvD3MzLw9zMy8PczMvD3MzLw9zMy8PczMvD3MzLw9');
        energySound.volume = 0.2;
        energySound.play();
        
        // Efeito de vibração na tela
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
        
        // Remover classe após animação
        setTimeout(() => {
            button.classList.remove('operator-effect');
        }, 500);
    });
});

// Atualizar o suporte ao teclado para incluir o efeito nos operadores
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const operatorKeys = ['+', '-', '*', '/', '%'];
    
    if (operatorKeys.includes(key)) {
        const operatorButton = Array.from(document.querySelectorAll('.operator'))
            .find(button => button.textContent.includes(key));
            
        if (operatorButton) {
            operatorButton.classList.add('operator-effect');
            createEnergyParticles(operatorButton, {
                clientX: operatorButton.offsetLeft + operatorButton.offsetWidth / 2,
                clientY: operatorButton.offsetTop + operatorButton.offsetHeight / 2
            });
            
            setTimeout(() => {
                operatorButton.classList.remove('operator-effect');
            }, 500);
        }
    }
});

// Função para adicionar efeito de onda de energia
function createEnergyWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'energy-wave';
    document.body.appendChild(wave);
    
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    
    setTimeout(() => wave.remove(), 1000);
}

function epicEqualEffect() {
    const calculator = document.querySelector('.calculator');
    const equalButton = document.querySelector('.equal');
    const allButtons = document.querySelectorAll('button');
    
    // Sequência de efeitos
    const sequence = async () => {
        // Efeito inicial no botão igual
        equalButton.classList.add('epic-effect');
        
        // Shake suave na calculadora
        calculator.classList.add('shake-effect');
        
        // Power surge centralizado
        calculator.classList.add('power-surge');
        
        // Efeito de brilho em sequência nos botões
        allButtons.forEach((button, index) => {
            setTimeout(() => {
                button.classList.add('button-glow');
                setTimeout(() => button.classList.remove('button-glow'), 500);
            }, index * 30);
        });
        
        // Partículas de energia centralizadas
        createEnergyParticles(equalButton);
        
        // Vibração do dispositivo mais suave
        if (window.navigator.vibrate) {
            window.navigator.vibrate([50, 25, 50]);
        }
        
        // Remover classes após as animações
        setTimeout(() => {
            equalButton.classList.remove('epic-effect');
            calculator.classList.remove('shake-effect', 'power-surge');
        }, 800);
    };
    
    sequence();
}

// Atualizar evento de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
        const equalButton = document.querySelector('.equal');
        epicEqualEffect();
    }
    // ... resto do código do evento keydown ...
});
  