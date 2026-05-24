# Calculadora de Métodos Numéricos

Uma aplicação interativa desenvolvida para execução, visualização e estudo prático de métodos numéricos.

---

## Tecnologias Utilizadas

A aplicação utiliza um ecossistema moderno e robusto voltado para a estabilidade, performance e tipagem estrita:

*   **Core:** React 18 + TypeScript (tipagem estrita)
*   **Empacotador & Dev Server:** Vite
*   **Interpretador Matemático:** MathJS (com otimização por cache de compilação de expressões e derivadas)
*   **Estilização & Componentes:** TailwindCSS + Radix UI / Shadcn boilerplate (design premium, responsivo e adaptativo)
*   **Validação & Qualidade:** ESLint (regras estritas) + Vitest (suíte de testes unitários automatizados)

---

## Como Executar o Projeto

Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em seu sistema operacional.

### 1. Instalar as dependências
```bash
npm install
```

### 2. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
A aplicação abrirá no endereço local fornecido no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

### 3. Executar a suíte de testes
Para validar o motor matemático e os critérios de parada/convergência:
```bash
npm test
```

### 4. Rodar o linter estático
Para assegurar a conformidade de tipagem e boas práticas:
```bash
npm run lint
```

### 5. Compilar o projeto para produção
Para gerar o pacote de build estático final minificado e otimizado na pasta `dist/`:
```bash
npm run build
```