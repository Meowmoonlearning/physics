        let particleSketch, pistonSketch;
        let volumeSlider, pressureSlider;
        let volumeFactor = 1;
        let pressure = 1;

        // Particle Animation (Molecular View)
        particleSketch = function (p) {
            let particles = [];
            let boxWidth = 400;
            let boxHeight = 300;
            const particleCount = 50;
            const baseSpeed = 2;
            let baseTemp = 300;
            let baseEnergy = 1;
            let statusText = "Stable, no change in temperature or energy.";
            let physicsExplanation = "In an adiabatic process, no heat is exchanged (Q = 0). During adiabatic expansion with non-zero external pressure, gas molecules perform work (W = PΔV) to overcome this pressure, reducing their internal energy (U = 3/2 NkT for an ideal gas) and thus lowering temperature. During compression, work is done on the gas, increasing molecular kinetic energy and temperature. At zero pressure, free expansion occurs, where no work is done (W = 0), so internal energy and temperature remain constant.";

            class Particle {
                constructor() {
                    this.pos = p.createVector(p.random(50, boxWidth - 50), p.random(50, boxHeight - 50));
                    this.vel = p5.Vector.random2D().mult(baseSpeed);
                    this.radius = 5;
                    this.energy = baseEnergy;
                }

                update() {
                    this.pos.add(this.vel);
                    // Adjust speed based on volume and pressure
                    let speedFactor = pressure > 0 ? baseSpeed / volumeFactor * (1 + pressure * 0.5) : baseSpeed;
                    this.vel.setMag(speedFactor);
                    this.energy = pressure > 0 ? 1 / volumeFactor * (1 + pressure * 0.5) : baseEnergy;
                    // Strict boundary collisions
                    let leftWall = (p.width - boxWidth * volumeFactor) / 2 + this.radius;
                    let rightWall = (p.width + boxWidth * volumeFactor) / 2 - this.radius;
                    let topWall = (p.height - boxHeight * volumeFactor) / 2 + this.radius;
                    let bottomWall = (p.height + boxHeight * volumeFactor) / 2 - this.radius;
                    if (this.pos.x <= leftWall || this.pos.x >= rightWall) {
                        this.vel.x *= -1;
                        this.pos.x = p.constrain(this.pos.x, leftWall, rightWall);
                    }
                    if (this.pos.y <= topWall || this.pos.y >= bottomWall) {
                        this.vel.y *= -1;
                        this.pos.y = p.constrain(this.pos.y, topWall, bottomWall);
                    }
                }

                draw() {
                    let energyColor;
                    if (pressure === 0) {
                        energyColor = p.color(255, 255, 255); // White for free expansion
                    } else {
                        let t = p.constrain(this.energy, 0.5, 2);
                        if (t <= 1) {
                            energyColor = p.lerpColor(p.color(0, 0, 139), p.color(100, 100, 255), t / 1);
                        } else {
                            energyColor = p.lerpColor(p.color(100, 100, 255), p.color(255, 0, 0), (t - 1) / 1);
                        }
                    }
                    p.fill(energyColor);
                    p.noStroke();
                    p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
                    p.fill(energyColor.levels[0], energyColor.levels[1], energyColor.levels[2], 50);
                    p.ellipse(this.pos.x, this.pos.y, this.radius * 3);
                }
            }

            p.setup = function () {
                let canvas = p.createCanvas(400, 300);
                canvas.parent('particle-canvas');
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
                volumeSlider = document.getElementById('volume-slider');
                pressureSlider = document.getElementById('pressure-slider');
            };

            p.draw = function () {
                p.background(0, 50);
                // Update volume and pressure
                volumeFactor = parseFloat(volumeSlider.value);
                pressure = parseFloat(pressureSlider.value);

                // Draw 3D-like box
                let currentWidth = boxWidth * volumeFactor;
                let currentHeight = boxHeight * volumeFactor;
                let x = (p.width - currentWidth) / 2;
                let y = (p.height - currentHeight) / 2;
                p.fill(255, 255, 255, 50);
                p.stroke(255);
                p.strokeWeight(2);
                p.rect(x, y, currentWidth, currentHeight, 10);
                p.fill(0, 0, 0, 20);
                p.noStroke();
                p.rect(x + 5, y + 5, currentWidth, currentHeight, 10);

                // Update and draw particles
                for (let particle of particles) {
                    particle.update();
                    particle.draw();
                }

                // Update temperature, energy, and status
                let temp = pressure > 0 ? baseTemp / volumeFactor * (1 + pressure * 0.5) : baseTemp;
                let energyStatus = pressure > 0 ? (volumeFactor > 1 ? "Decreasing" : volumeFactor < 1 ? "Increasing" : "Normal") : "Constant (Free Expansion)";
                if (pressure === 0) {
                    statusText = "Free expansion: No temperature or energy change due to zero pressure.";
                    physicsExplanation = "In free expansion (pressure = 0), the gas expands into a vacuum without doing work, so internal energy and temperature remain constant.";
                } else if (volumeFactor > 1) {
                    statusText = "Adiabatic expansion: Temperature and kinetic energy decreasing.";
                    physicsExplanation = "In adiabatic expansion, the gas does work against external pressure (W = PΔV), reducing its internal energy (U = 3/2 NkT), leading to a lower temperature.";
                } else if (volumeFactor < 1) {
                    statusText = "Adiabatic compression: Temperature and kinetic energy increasing.";
                    physicsExplanation = "In adiabatic compression, work is done on the gas by external pressure, increasing molecular collisions and kinetic energy, raising the temperature.";
                } else {
                    statusText = "Stable: No change in temperature or energy.";
                    physicsExplanation = "At constant volume with non-zero pressure, no work is done, so internal energy and temperature remain constant.";
                }

                document.getElementById('particle-status').innerText = `Status: ${statusText}`;
                document.getElementById('physics-explanation').innerText = physicsExplanation;
                document.getElementById('particle-parameters').innerText = `Temp: ${temp.toFixed(0)}K, Pressure: ${pressure.toFixed(2)} atm, Kinetic Energy: ${energyStatus}`;
                p.fill(255);
                p.textSize(16);
                p.text(`Temp: ${temp.toFixed(0)}K`, 10, 30);
            };
        };

        // Piston-Cylinder Animation
        pistonSketch = function (p) {
            let particles = [];
            let cylinderWidth = 200;
            let cylinderHeight = 300;
            const particleCount = 20;
            const baseSpeed = 2;
            let baseTemp = 300;
            let baseEnergy = 1;
            let statusText = "Stable, no change in temperature or energy.";
            let pistonExplanation = "The piston-cylinder demonstrates adiabatic processes. In adiabatic expansion, the piston moves outward as the gas does work against external pressure, reducing internal energy and temperature. In compression, the piston is pushed inward, increasing energy and temperature. At zero pressure, free expansion occurs, with no work done, maintaining constant temperature.";

            class Particle {
                constructor() {
                    this.pos = p.createVector(p.random((p.width - cylinderWidth) / 2 + 50, (p.width + cylinderWidth) / 2 - 50), p.random(150, cylinderHeight - 50));
                    this.vel = p5.Vector.random2D().mult(baseSpeed);
                    this.radius = 5;
                    this.energy = baseEnergy;
                }

                update(pistonY) {
                    this.pos.add(this.vel);
                    // Adjust speed based on volume and pressure
                    let speedFactor = pressure > 0 ? baseSpeed / volumeFactor * (1 + pressure * 0.5) : baseSpeed;
                    this.vel.setMag(speedFactor);
                    this.energy = pressure > 0 ? 1 / volumeFactor * (1 + pressure * 0.5) : baseEnergy;
                    // Strict boundary collisions
                    let leftWall = (p.width - cylinderWidth) / 2 + this.radius;
                    let rightWall = (p.width + cylinderWidth) / 2 - this.radius;
                    let topWall = pistonY + this.radius;
                    let bottomWall = cylinderHeight - this.radius;
                    if (this.pos.x <= leftWall || this.pos.x >= rightWall) {
                        this.vel.x *= -1;
                        this.pos.x = p.constrain(this.pos.x, leftWall, rightWall);
                    }
                    if (this.pos.y <= topWall || this.pos.y >= bottomWall) {
                        this.vel.y *= -1;
                        this.pos.y = p.constrain(this.pos.y, topWall, bottomWall);
                    }
                }

                draw() {
                    let energyColor;
                    if (pressure === 0) {
                        energyColor = p.color(255, 255, 255);
                    } else {
                        let t = p.constrain(this.energy, 0.5, 2);
                        if (t <= 1) {
                            energyColor = p.lerpColor(p.color(0, 0, 139), p.color(100, 100, 255), t / 1);
                        } else {
                            energyColor = p.lerpColor(p.color(100, 100, 255), p.color(255, 0, 0), (t - 1) / 1);
                        }
                    }
                    p.fill(energyColor);
                    p.noStroke();
                    p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
                    p.fill(energyColor.levels[0], energyColor.levels[1], energyColor.levels[2], 50);
                    p.ellipse(this.pos.x, this.pos.y, this.radius * 3);
                }
            }

            p.setup = function () {
                let canvas = p.createCanvas(400, 300);
                canvas.parent('piston-canvas');
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            };

            p.draw = function () {
                p.background(0, 50);
                // Update volume and pressure
                volumeFactor = parseFloat(volumeSlider.value);
                pressure = parseFloat(pressureSlider.value);

                // Calculate piston position
                let minPistonY = 50; // Minimum piston position
                let maxPistonY = 200; // Maximum piston position
                let pistonY = minPistonY + (maxPistonY - minPistonY) * (1.5 - volumeFactor) / (1.5 - 0.7); // Linear mapping
                let cylinderLeft = (p.width - cylinderWidth) / 2;
                let cylinderRight = (p.width + cylinderWidth) / 2;

                // Draw realistic cylinder
                p.fill(p.lerpColor(p.color(100, 100, 100), p.color(150, 150, 150), 0.5));
                p.stroke(255);
                p.strokeWeight(2);
                p.rect(cylinderLeft, 50, cylinderWidth, cylinderHeight - 50, 10);
                p.fill(0, 0, 0, 20);
                p.noStroke();
                p.rect(cylinderLeft + 5, 55, cylinderWidth, cylinderHeight - 50, 10);

                // Draw realistic piston with rod
                p.fill(p.lerpColor(p.color(150, 150, 150), p.color(200, 200, 200), 0.5));
                p.stroke(255);
                p.strokeWeight(2);
                p.rect(cylinderLeft, pistonY, cylinderWidth, 20, 5);
                p.fill(0, 0, 0, 50);
                p.noStroke();
                p.rect(cylinderLeft + 3, pistonY + 3, cylinderWidth, 20, 5);
                // Piston rod
                p.fill(100, 100, 100);
                p.rect(cylinderLeft + cylinderWidth / 2 - 10, pistonY - 30, 20, 50, 5);

                // Update and draw particles
                for (let particle of particles) {
                    particle.update(pistonY);
                    particle.draw();
                }

                // Update temperature, energy, and status
                let temp = pressure > 0 ? baseTemp / volumeFactor * (1 + pressure * 0.5) : baseTemp;
                let energyStatus = pressure > 0 ? (volumeFactor > 1 ? "Decreasing" : volumeFactor < 1 ? "Increasing" : "Normal") : "Constant (Free Expansion)";
                if (pressure === 0) {
                    statusText = "Free expansion: No temperature or energy change.";
                    pistonExplanation = "In free expansion, the piston moves freely with no external pressure, so no work is done, and the gas's internal energy and temperature remain constant.";
                } else if (volumeFactor > 1) {
                    statusText = "Adiabatic expansion: Temperature and kinetic energy decreasing.";
                    pistonExplanation = "In adiabatic expansion, the piston moves outward as the gas does work against external pressure, reducing internal energy and temperature.";
                } else if (volumeFactor < 1) {
                    statusText = "Adiabatic compression: Temperature and kinetic energy increasing.";
                    pistonExplanation = "In adiabatic compression, the piston is pushed inward, doing work on the gas, increasing molecular collisions, internal energy, and temperature.";
                } else {
                    statusText = "Stable: No change in temperature or energy.";
                    pistonExplanation = "At constant volume, the piston remains stationary, and with non-zero pressure, no work is done, so internal energy and temperature are constant.";
                }

                document.getElementById('piston-status').innerText = `Status: ${statusText}`;
                document.getElementById('piston-explanation').innerText = pistonExplanation;
                document.getElementById('piston-parameters').innerText = `Temp: ${temp.toFixed(0)}K, Pressure: ${pressure.toFixed(2)} atm, Kinetic Energy: ${energyStatus}`;
                p.fill(255);
                p.textSize(16);
                p.text(`Temp: ${temp.toFixed(0)}K`, 10, 30);
            };
        };

        // Initialize sketches
        new p5(particleSketch);
        new p5(pistonSketch);

        // Kid-friendly explanation function
        function showKidFriendlyExplanation() {
            let volume = parseFloat(volumeSlider.value);
            let pressure = parseFloat(pressureSlider.value);
            let message;

            if (pressure === 0) {
                message = "Hey there! This is called *free expansion*. Imagine a bunch of tiny balls (gas molecules) bouncing around in a box with no walls pushing back. They can spread out as much as they want without getting tired, so they don't get hotter or colder. The temperature stays the same because they're not fighting against anything!";
            } else if (volume > 1) {
                message = "Hi! This is *adiabatic expansion*. Picture tiny balls in a box that's getting bigger. The balls have to push against the walls to make the box bigger, and that pushing makes them lose energy, like getting tired after running. When they lose energy, they move slower and the gas gets colder. That's why the box looks blue!";
            } else if (volume < 1) {
                message = "Hello! This is *adiabatic compression*. Imagine squeezing a box full of tiny bouncing balls. When the box gets smaller, the balls bump into each other and the walls more often, like getting super excited. This makes them move faster and the gas gets hotter. That's why the box looks red!";
            } else {
                message = "Hey! Right now, the box isn't changing size, so the tiny balls inside are just bouncing around normally. They're not getting hotter or colder because they're not pushing or being squeezed. Everything stays the same!";
            }

            alert(message);
        }
