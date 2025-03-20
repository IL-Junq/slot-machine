class SlotMachine {
    constructor() {
        this.slots = document.querySelectorAll('.slot');
        this.spinButton = document.getElementById('spin-button');
        this.imageUpload = document.getElementById('image-upload');
        this.imagePreview = document.getElementById('image-preview');
        this.selectedImages = document.getElementById('selected-images');
        this.dropZone = document.getElementById('drop-zone');
        this.settingsPanel = document.getElementById('settings-panel');
        this.toggleButton = document.getElementById('toggle-upload');
        
        // Sound elements
        this.spinSound = new Audio('https://github.com/IL-Junq/slot-machine/blob/master/sounds/jackpotsoundeffect.mp3');
        this.spinSound.playbackRate = 1.0; // Normal speed
        this.winSound = document.getElementById('winSound');
        
        this.isSpinning = false;
        this.symbolHeight = 100;
        this.symbolsPerSlot = 7;
        this.speed = 50;
        this.speeds = [50, 100, 150, 200];
        this.currentSpeed = 0;
        this.speedIndex = 0;
        this.images = [];
        this.slotImages = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.spinButton.addEventListener('click', () => this.spin());
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        this.toggleButton.addEventListener('click', () => this.toggleSettingsPanel());
        
        // Drag and drop event listeners
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Selected images box drag and drop
        this.selectedImages.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.selectedImages.classList.add('drag-over');
        });
        
        this.selectedImages.addEventListener('dragleave', () => {
            this.selectedImages.classList.remove('drag-over');
        });
        
        this.selectedImages.addEventListener('drop', (e) => {
            e.preventDefault();
            this.selectedImages.classList.remove('drag-over');
            const imageSrc = e.dataTransfer.getData('text/plain');
            this.addToSelectedImages(imageSrc);
        });

        // Slot drag and drop
        this.slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const imageSrc = e.dataTransfer.getData('text/plain');
                this.addImageToSlot(slot, imageSrc);
            });
        });
    }

    toggleSettingsPanel() {
        this.settingsPanel.classList.toggle('show');
        this.toggleButton.textContent = this.settingsPanel.classList.contains('show') ? 'Hide Upload' : 'Upload Images';
    }

    handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.images.push(e.target.result);
                    this.createImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    handleImageUpload(event) {
        this.handleFiles(event.target.files);
    }

    createImagePreview(src) {
        const container = document.createElement('div');
        container.className = 'preview-container';
        
        const img = document.createElement('img');
        img.src = src;
        img.className = 'preview-image';
        img.draggable = true;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '×';
        deleteButton.addEventListener('click', () => this.deleteImage(container, src));
        
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', src);
            img.classList.add('dragging');
        });
        
        img.addEventListener('dragend', () => {
            img.classList.remove('dragging');
        });
        
        container.appendChild(img);
        container.appendChild(deleteButton);
        this.imagePreview.appendChild(container);
    }

    addToSelectedImages(src) {
        // Check if image already exists in selected images
        if (this.slotImages.includes(src)) {
            return;
        }
        
        // Add to slotImages array
        this.slotImages.push(src);
        
        // Create preview only once
        this.createSelectedImagePreview(src);
        
        // Update slots only once after adding the image
        this.updateAllSlots();
    }

    createSelectedImagePreview(src) {
        const container = document.createElement('div');
        container.className = 'preview-container';
        
        const img = document.createElement('img');
        img.src = src;
        img.className = 'preview-image';
        img.draggable = true;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '×';
        deleteButton.addEventListener('click', () => this.deleteSelectedImage(container, src));
        
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', src);
            img.classList.add('dragging');
        });
        
        img.addEventListener('dragend', () => {
            img.classList.remove('dragging');
        });
        
        container.appendChild(img);
        container.appendChild(deleteButton);
        this.selectedImages.appendChild(container);
        
        // Remove empty message if it exists
        const emptyMessage = this.selectedImages.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }

    deleteImage(container, src) {
        this.images = this.images.filter(img => img !== src);
        container.remove();
    }

    deleteSelectedImage(container, src) {
        this.slotImages = this.slotImages.filter(img => img !== src);
        container.remove();
        this.updateAllSlots();
        
        // Add empty message if no images left
        if (this.slotImages.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Drag images here to use in slot machine';
            this.selectedImages.appendChild(emptyMessage);
        }
    }

    addImageToSlot(slot, imageSrc) {
        // Only add to selected images if not already there
        if (!this.slotImages.includes(imageSrc)) {
            this.addToSelectedImages(imageSrc);
        }
    }

    updateAllSlots() {
        if (this.slotImages.length === 0) {
            this.slots.forEach(slot => {
                const symbols = slot.querySelector('.symbols');
                symbols.innerHTML = '';
            });
            return;
        }

        // Update all slots with current images
        this.symbolsPerSlot = this.slotImages.length;
        this.slots.forEach(slot => {
            const symbols = slot.querySelector('.symbols');
            symbols.innerHTML = '';
            
            // Create symbols for each image
            this.slotImages.forEach(src => {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                const img = document.createElement('img');
                img.src = src;
                symbol.appendChild(img);
                symbols.appendChild(symbol);
            });
        });
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.speedIndex = 0;

        // Calculate total spin duration more accurately
        const baseSpins = 20;
        const lastSlotIndex = this.slots.length - 1;
        const lastSlotSpins = baseSpins + (lastSlotIndex * 5);
        const spinTime = lastSlotSpins * this.speeds[0]; // Time for spins
        const delayTime = lastSlotIndex * 500; // Time for delays between slots
        const stopTime = this.slots.length * 200; // Time for stop animations
        const totalDuration = spinTime + delayTime + stopTime;

        // Start playing the spin sound
        if (this.spinSound) {
            this.spinSound.currentTime = 0;
            // Calculate and set playback rate
            const soundDuration = this.spinSound.duration * 1000; // Convert to ms
            this.spinSound.playbackRate = soundDuration / totalDuration;
            this.spinSound.play();
        }
        
        this.slots.forEach((slot, index) => {
            setTimeout(() => {
                this.startSlotSpin(slot, index);
            }, index * 500);
        });
    }

    startSlotSpin(slot, slotIndex) {
        const symbols = slot.querySelector('.symbols');
        let currentPosition = 0;
        let spins = 0;
        const totalSpins = 20 + slotIndex * 5;
        
        const spin = () => {
            if (spins >= totalSpins) {
                this.stopSlotSpin(slot, slotIndex);
                return;
            }
            
            currentPosition -= this.speed;
            if (currentPosition <= -this.symbolHeight * this.symbolsPerSlot) {
                currentPosition = 0;
            }
            
            symbols.style.top = `${currentPosition}px`;
            spins++;
            
            requestAnimationFrame(() => {
                setTimeout(spin, this.speeds[this.speedIndex]);
            });
        };
        
        spin();
    }

    stopSlotSpin(slot, slotIndex) {
        const symbols = slot.querySelector('.symbols');
        const randomSymbol = Math.floor(Math.random() * this.symbolsPerSlot);
        const finalPosition = -randomSymbol * this.symbolHeight;
        
        // Ensure smooth stop animation
        symbols.style.transition = 'top 0.2s ease-out';
        symbols.style.top = `${finalPosition}px`;
        
        // Reset transition after stop
        setTimeout(() => {
            symbols.style.transition = 'top 0.05s linear';
        }, 200);
        
        if (slotIndex === this.slots.length - 1) {
            this.checkWin();
        }
    }

    checkWin() {
        const results = Array.from(this.slots).map(slot => {
            const symbols = slot.querySelector('.symbols');
            const top = parseInt(symbols.style.top);
            return Math.abs(top / this.symbolHeight);
        });
        
        const isWin = results.every(result => result === results[0]);
        
        setTimeout(() => {
            // Stop the spin sound
            if (this.spinSound) {
                this.spinSound.pause();
                this.spinSound.currentTime = 0;
            }

            this.isSpinning = false;
            this.spinButton.disabled = false;
            
            if (isWin && this.winSound) {
                this.winSound.currentTime = 0;
                this.winSound.play();
                setTimeout(() => {
                    alert('Congratulations! You won!');
                }, 500);
            }
        }, 500);
    }
}

// Initialize the slot machine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachine();
}); 
