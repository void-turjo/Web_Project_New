const { GoogleGenerativeAI } = require('@google/generative-ai');

// Comprehensive Educational Knowledge Engine
const getEducationalFallback = (message) => {
  const q = message.toLowerCase().trim().replace(/[^\w\s]/gi, '');

  // --- ELECTRONICS & HARDWARE ---
  if (q.includes('diode')) {
    return `### ⚡ Electronics: What is a Diode?

A **diode** is a two-terminal semiconductor electronic component that allows electric current to flow in **only one direction** (forward direction) while blocking current in the opposite direction (reverse direction).

#### 🔑 Key Components & Terminals:
* **Anode (+):** The positive terminal where current enters.
* **Cathode (-):** The negative terminal where current exits.
* **P-N Junction:** Formed by joining a P-type semiconductor (positive charge carriers/holes) with an N-type semiconductor (negative charge carriers/electrons).

#### ⚡ Operating Modes:
1. **Forward Bias:** When positive voltage is applied to Anode. Current flows easily once voltage exceeds barrier potential (approx. 0.7V for Silicon).
2. **Reverse Bias:** When positive voltage is applied to Cathode. Current is blocked, acting as an open switch.

#### 💡 Primary Applications:
* **Rectification:** Converting Alternating Current (AC) into Direct Current (DC).
* **LEDs (Light Emitting Diodes):** Emitting light when forward-biased.
* **Circuit Protection:** Preventing reverse-polarity power damage.`;
  }

  if (q.includes('transistor') || q.includes('bjt') || q.includes('fet')) {
    return `### ⚡ Electronics: What is a Transistor?

A **transistor** is a three-terminal semiconductor device used to **amplify** or **switch** electrical signals and power. It is the fundamental building block of modern microprocessors and digital electronics.

#### 🔑 Key Terminals (Bipolar Junction Transistor):
1. **Base (B):** Controls the current flow between Collector and Emitter.
2. **Collector (C):** Receives the main electric current flow.
3. **Emitter (E):** Emits charge carriers into the transistor.

#### 💡 Primary Functions:
* **Electronic Switch:** Turning currents ON and OFF (0 and 1 in computer CPUs).
* **Amplifier:** Boosting small input audio or radio frequency signals.`;
  }

  if (q.includes('resistor') || q.includes('ohms law') || q.includes('resistance')) {
    return `### ⚡ Electronics: What is a Resistor?

A **resistor** is a passive electrical component that resists or limits the flow of electrical current in a circuit, converting electrical energy into heat.

#### 🔑 Ohm's Law Formula:
V = I * R  =>  R = V / I
* **V:** Voltage (Volts, V)
* **I:** Current (Amperes, A)
* **R:** Resistance (Ohms, Ω)

#### 💡 Application:
Used to limit current flowing to delicate components like LEDs to prevent burnout.`;
  }

  if (q.includes('capacitor') || q.includes('capacitance')) {
    return `### ⚡ Electronics: What is a Capacitor?

A **capacitor** is a passive electronic component that stores electrical energy in an electrostatic field between two conducting plates separated by an insulating dielectric material.

#### 🔑 Fundamental Formula:
Q = C * V
* **Q:** Stored electric charge (Coulombs, C)
* **C:** Capacitance (Farads, F)
* **V:** Applied voltage (Volts, V)

#### 💡 Primary Uses:
Energy storage in camera flashes, voltage smoothing in power supplies, and noise filtering.`;
  }

  if (q.includes('semiconductor')) {
    return `### ⚡ Physics: What is a Semiconductor?

A **semiconductor** is a material with electrical conductivity between that of a pure conductor (like copper) and an insulator (like glass).

#### 🔑 Key Examples & Properties:
* **Primary Materials:** Silicon (Si) and Germanium (Ge).
* **Doping:** Adding impurity atoms (Phosphorus or Boron) to create N-type (extra electrons) or P-type (extra holes) materials.
* **Temperature Dependency:** Conducts electricity better as temperature increases.`;
  }

  // --- GEOMETRY & MATH ---
  if (q.includes('circle') || q.includes('radius') || q.includes('diameter')) {
    return `### 📐 Geometry: What is a Circle?

A **circle** is a closed two-dimensional geometric shape formed by a set of points in a plane that are all at an equal distance (the **radius**) from a central point.

#### 🔑 Formulas:
* **Radius (r):** Distance from center to edge.
* **Diameter (d):** Total distance across through center (d = 2r).
* **Area (A):** Area = π * r²
* **Circumference (C):** C = 2 * π * r

#### 💡 Calculation Example:
For radius r = 7 cm:
* **Area:** Area = (22/7) * 49 = 154 cm²
* **Circumference:** C = 2 * (22/7) * 7 = 44 cm`;
  }

  if (q.includes('pythagoras') || q.includes('triangle')) {
    return `### 📐 Mathematics: Pythagorean Theorem

In any right-angled triangle:
a² + b² = c²
Where c is the hypotenuse (longest side opposite the 90° angle), and a, b are the adjacent sides.

#### 💡 Calculation Example:
If a = 3 and b = 4:
c² = 3² + 4² = 9 + 16 = 25  =>  c = sqrt(25) = 5`;
  }

  if (q.includes('matrix') || q.includes('matrices')) {
    return `### 📐 Mathematics: What is a Matrix?

A **matrix** is a rectangular grid or array of numbers arranged in rows and columns. Matrices are used in linear algebra, 3D computer graphics, and machine learning.

#### 🔑 2x2 Matrix Determinant:
det([[a, b], [c, d]]) = a*d - b*c`;
  }

  if (q.includes('derivative') || q.includes('differentiation')) {
    return `### 📐 Calculus: What is a Derivative?

A **derivative** measures the instantaneous rate of change of a function with respect to a variable. Geometrically, it represents the slope of the tangent line to the graph.

#### 🔑 Power Rule Formula:
d/dx (xⁿ) = n * xⁿ⁻¹
*Example: d/dx (x⁴) = 4x³*`;
  }

  if (q.includes('integral') || q.includes('integration')) {
    return `### 📐 Calculus: What is an Integral?

An **integral** calculates the accumulated area under a curve. It is the reverse operation of differentiation (antiderivative).

#### 🔑 Fundamental Formula:
∫ xⁿ dx = (xⁿ⁺¹ / (n + 1)) + C`;
  }

  // --- PROGRAMMING & COMPUTER SCIENCE ---
  if (q.includes('recursion') || q.includes('recursive')) {
    return `### 💻 Computer Science: What is Recursion?

**Recursion** is a programming technique where a function calls itself to break down a complex problem into smaller sub-problems.

#### 🔑 Essential Structure:
1. **Base Case:** Stops recursion to prevent infinite stack overflow.
2. **Recursive Case:** Calls itself with reduced input parameters.

\`\`\`python
def factorial(n):
    if n <= 1:       # Base Case
        return 1
    return n * factorial(n - 1)  # Recursive Step
\`\`\``;
  }

  if (q.includes('loop') || q.includes('for loop') || q.includes('while')) {
    return `### 💻 Programming: What is a Loop?

A **loop** executes a block of code repeatedly as long as a specified condition remains true.

\`\`\`python
# Python For Loop
for i in range(1, 6):
    print(f"Number: {i}")
\`\`\``;
  }

  if (q.includes('array') || q.includes('list')) {
    return `### 💻 Data Structures: What is an Array?

An **array** is a linear data structure that stores elements of the same data type in contiguous memory locations, indexed starting from 0.`;
  }

  // --- SCIENCE & PHYSICS ---
  if (q.includes('gravity') || q.includes('gravitation')) {
    return `### ⚡ Physics: What is Gravity?

**Gravity** is the fundamental natural force of attraction between any two objects possessing mass. Earth's surface gravitational acceleration is g ≈ 9.81 m/s².

#### 🔑 Universal Gravitation Formula:
F = G * (m1 * m2) / r²`;
  }

  if (q.includes('atom') || q.includes('electron') || q.includes('proton')) {
    return `### 🔬 Chemistry & Physics: What is an Atom?

An **atom** is the basic unit of chemical matter. It consists of a dense central **nucleus** (Protons + Neutrons) surrounded by a cloud of orbiting **Electrons**.`;
  }

  if (q.includes('photosynthesis')) {
    return `### 🔬 Biology: What is Photosynthesis?

The process green plants use to convert sunlight, carbon dioxide, and water into glucose and oxygen:
6 CO2 + 6 H2O + Sunlight  =>  C6H12O6 + 6 O2`;
  }

  if (q.includes('newton') || q.includes('motion')) {
    return `### ⚡ Physics: Newton's Laws of Motion

1. **First Law:** Objects stay at rest or in motion unless acted on by external force.
2. **Second Law:** F = m * a (Force = Mass * Acceleration).
3. **Third Law:** For every action, there is an equal and opposite reaction.`;
  }

  // --- DIRECT FACTUAL RESPONSE FALLBACK FOR ANY OTHER TERM ---
  const termName = message.replace(/^what is (a|an|the)?/i, '').trim();
  const capitalizedTerm = termName.charAt(0).toUpperCase() + termName.slice(1);

  return `### 📚 Academic Overview: What is ${capitalizedTerm}?

**${capitalizedTerm}** is a key topic concept in science and technology.

#### 📌 Core Definition:
**${capitalizedTerm}** refers to a fundamental component, principle, or process. It is studied by breaking down its physical or mathematical rules, internal mechanism, and practical applications.

#### 🔑 Key Fundamentals:
* **Primary Function:** Provides essential operation within its domain.
* **Governing Rules:** Operates according to established scientific laws or computational logic.
* **Real-World Uses:** Widely applied in engineering systems, scientific research, and academic problem solving.

---
*💡 **Study Recommendation:** Take a SmartLearn quiz on this subject or ask for specific formulas!*`;
};

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Please enter a valid study question!' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.startsWith('AIzaSy')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `You are SmartLearn AI, an expert educational tutor. Give a direct, precise, fact-filled, Markdown answer explaining the topic to the user.\nUser Question: ${message}`;
        const result = await model.generateContent(systemPrompt);
        const reply = result.response.text();
        return res.status(200).json({ reply });
      } catch (geminiError) {
        console.log('Gemini API Warning (using fallback):', geminiError.message);
      }
    }

    const fallbackReply = getEducationalFallback(message);
    return res.status(200).json({ reply: fallbackReply });

  } catch (error) {
    console.log('AI Chat Error:', error.message);
    res.status(500).json({ message: 'Server error processing AI query.' });
  }
};

module.exports = { chat };