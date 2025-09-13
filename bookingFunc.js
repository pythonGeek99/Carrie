        const CALENDLY_USERNAME = "jysvertising"; // Your Calendly username

        let currentStep = 1;
        let formData = {
            firstName: '',
            email: '',
            nonprofitStatus: '',
            priority: '',
            isCommitted: false,
            isCalendlyBooked: false,
            calendlyEventUri: null,
            calendlyEventData: null,
            eventDate: '',
            eventTime: '',
            eventDuration: '30 minutes'
        };

        const stepTitles = {
            1: 'Basic Information',
            2: 'Choose Time',
            3: 'Your Nonprofit',
            4: 'Confirm'
        };

        const progressWidths = {
            1: '25%',
            2: '50%',
            3: '75%',
            4: '95%'
        };

        // Track Calendly initialization state
        let calendlyInitialized = false;

        function openModal() {
            document.getElementById('modalOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
            document.body.style.overflow = 'auto';
            resetForm();
        }

        function resetForm() {
            currentStep = 1;
            formData = {
                firstName: '',
                email: '',
                nonprofitStatus: '',
                priority: '',
                isCommitted: false,
                isCalendlyBooked: false,
                calendlyEventUri: null,
                calendlyEventData: null,
                eventDate: '',
                eventTime: '',
                eventDuration: '30 minutes'
            };
            
            calendlyInitialized = false;
            
            // Reset form fields
            document.getElementById('firstName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('commitment').checked = false;
            
            // Reset radio buttons
            document.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
                option.querySelector('input').checked = false;
            });
            
            // Clear errors
            clearErrors();
            
            // Reset to step 1
            showStep(1);
        }
        
        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.step').forEach(s => {
                s.classList.remove('active');
            });
            
            // Show current step
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update step info
            document.getElementById('currentStepNum').textContent = step;
            document.getElementById('stepTitle').textContent = stepTitles[step];
            
            // Update progress bar
            document.getElementById('progressFill').style.width = progressWidths[step];
            
            // Show/hide back button
            const backBtn = document.getElementById('backBtn');
            if (step > 1) {
                backBtn.style.display = 'block';
                
            } else {
                backBtn.style.display = 'none';
            }
            
        
            
            // Update next button text and visibility
            const nextBtn = document.getElementById('nextBtn');
            if (step === 4) {
                nextBtn.textContent = 'Confirm My Consultation';
                nextBtn.style.display = 'block';
            } else if (step === 2) {
                // Hide next button on step 2 (Calendly step)
                nextBtn.style.display = 'none';
            } else {
                nextBtn.textContent = 'Next →';
                nextBtn.style.display = 'block';
            }
            
            // Special handling for step 2
            if (step === 2) {
                // Only load Calendly if not already initialized
                if (!calendlyInitialized) {
                    loadCalendlyWidget();
                }
            }
            
            // Special handling for step 4
            if (step === 4) {
                populateConfirmationDetails();
            }
            
            currentStep = step;
        }

        function nextStep() {
            if (validateCurrentStep()) {
                if (currentStep < 4) {
                    showStep(currentStep + 1);
                } else {
                    submitForm();
                }
            }
        }

        function previousStep() {
            if (currentStep > 1) {
                clearErrors();
                showStep(currentStep - 1);
            }
        }

        function validateCurrentStep() {
            clearErrors();
            let isValid = true;

            switch (currentStep) {
                case 1:
                    const firstName = document.getElementById('firstName').value.trim();
                    const email = document.getElementById('email').value.trim();
                    
                    if (!firstName) {
                        showError('firstNameError', 'First name is required');
                        isValid = false;
                    } else {
                        formData.firstName = firstName;
                    }
                    
                    if (!email) {
                        showError('emailError', 'Email is required');
                        isValid = false;
                    } else if (!isValidEmail(email)) {
                        showError('emailError', 'Please enter a valid email address');
                        isValid = false;
                    } else {
                        formData.email = email;
                    }
                    break;
                case 2:
                    if (!formData.isCalendlyBooked) {
                        showError('calendlyError', 'Please book your time slot before proceeding.');
                        isValid = false;
                    }
                    break;
                case 3:
                    if (!formData.nonprofitStatus) {
                        showError('nonprofitError', 'Please select your nonprofit status');
                        isValid = false;
                    }
                    
                    if (!formData.priority) {
                        showError('priorityError', 'Please select your biggest priority');
                        isValid = false;
                    }
                    break;
                case 4:
                    if (!formData.isCommitted) {
                        showError('commitmentError', 'Please confirm your commitment to attend');
                        isValid = false;
                    }
                    break;
            }

            return isValid;
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function clearErrors() {
            document.querySelectorAll('.error-text').forEach(error => {
                error.style.display = 'none';
            });
        }

        function selectOption(groupName, value, element) {
            // Remove selected class from all options in the group
            const group = element.parentNode;
            group.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
                option.querySelector('input').checked = false;
            });
            
            // Add selected class to clicked option
            element.classList.add('selected');
            element.querySelector('input').checked = true;
            
            // Store in form data
            formData[groupName] = value;
        }

        function loadCalendlyWidget() {
            const container = document.getElementById('calendlyContainer');
            container.innerHTML = ''; // Clear previous content

            // Create the Calendly inline widget container
            const calendlyDiv = document.createElement('div');
            calendlyDiv.className = 'calendly-inline-widget';
            calendlyDiv.style.width = '100%';
            calendlyDiv.style.minHeight = '650px';
            calendlyDiv.style.height = '650px';

            // Construct Calendly URL with prefill parameters
            const calendlyUrl = `https://calendly.com/${CALENDLY_USERNAME}/30min?hide_event_type_details=1&hide_gdpr_banner=1&name=${encodeURIComponent(formData.firstName)}&email=${encodeURIComponent(formData.email)}`;

            calendlyDiv.setAttribute('data-url', calendlyUrl);
            container.appendChild(calendlyDiv);

            // Function to initialize Calendly widget and attach event listener
            function initializeCalendly() {
                // Initialize the inline widget
                Calendly.initInlineWidget({
                    url: calendlyUrl,
                    parentElement: calendlyDiv,
                    prefill: {
                        name: formData.firstName,
                        email: formData.email
                    },
                    styles: {
                        height: '650px',
                        primaryColor: '#C2A671',
                        textColor: '#333333'
                    },
                    utm: {}
                });

                // Add event listener for booking completion
                Calendly.on('event_scheduled', function(e) {
                    console.log('Calendly event scheduled:', e);
                    formData.isCalendlyBooked = true;
                    formData.calendlyEventUri = e.data.event.uri;
                    formData.calendlyEventData = e.data;
                    
                    // Extract date and time from the event
                    if (e.data.event && e.data.event.start_time) {
                        const eventDate = new Date(e.data.event.start_time);
                        formData.eventDate = eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                        formData.eventTime = eventDate.toLocaleTimeString('en-US', {
                            hour: '2-digit', 
                            minute:'2-digit',
                            timeZoneName: 'short'
                        });
                    }
                    
                    // Show a success message
                    const successMsg = document.createElement('div');
                    successMsg.innerHTML = '<div style="text-align: center; padding: 16px; background-color: #f0f9f0; color: #2e7d32; border-radius: 8px; margin-top: 16px;"><strong>✓ Successfully booked!</strong> Proceeding to next step...</div>';
                    container.appendChild(successMsg);
                    
                    // Auto-proceed to next step after a short delay
                    setTimeout(() => {
                        nextStep();
                    }, 2000);
                });
                
                calendlyInitialized = true;
            }

            // Load Calendly script if not loaded yet
            if (typeof Calendly === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://assets.calendly.com/assets/external/widget.js';
                script.async = true;
                script.onload = initializeCalendly;
                document.head.appendChild(script);
            } else {
                initializeCalendly();
            }
            
            // Add a postMessage listener as a backup
            window.addEventListener('message', function(e) {
                if (e.origin.includes('calendly.com') && e.data.event === 'calendly.event_scheduled') {
                    console.log('Calendly event scheduled via postMessage:', e.data);
                    formData.isCalendlyBooked = true;
                    formData.calendlyEventUri = e.data.payload.event.uri;
                    formData.calendlyEventData = e.data.payload;
                    
                    // Extract date and time from the event
                    if (e.data.payload.event && e.data.payload.event.start_time) {
                        const eventDate = new Date(e.data.payload.event.start_time);
                        formData.eventDate = eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                        formData.eventTime = eventDate.toLocaleTimeString('en-US', {
                            hour: '2-digit', 
                            minute:'2-digit',
                            timeZoneName: 'short'
                        });
                    }
                    
                    // Auto-proceed to next step after a short delay
                    setTimeout(() => {
                        nextStep();
                    }, 1500);
                }
            });
        }

        function toggleCommitment() {
            formData.isCommitted = document.getElementById('commitment').checked;
        }

        function populateConfirmationDetails() {
            document.getElementById('confirmName').textContent = formData.firstName;
            document.getElementById('confirmEmail').textContent = formData.email;
            
            // Update with actual booked date and time
            document.getElementById('confirmDate').textContent = formData.eventDate || 'To be confirmed';
            document.getElementById('confirmTime').textContent = formData.eventTime || 'To be confirmed';
            document.getElementById('confirmDuration').textContent = formData.eventDuration;
        }

        function submitForm() {
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.innerHTML = '<span class="loading"></span> Processing...';
            nextBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                nextBtn.innerHTML = 'Confirm My Consultation';
                nextBtn.disabled = false;
                
                showSuccessAnimation();
            }, 2000);
        }

        function showSuccessAnimation() {
            // Create money falling animation
            const moneyContainer = document.getElementById('moneyAnimation');
            const moneyEmojis = ['💰', '💵', '💴', '💶', '💷', '🤑'];
            
            for (let i = 0; i < 15; i++) {
                const money = document.createElement('div');
                money.className = 'money-emoji';
                money.textContent = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];
                money.style.left = Math.random() * 100 + '%';
                money.style.animationDelay = Math.random() * 2 + 's';
                money.style.animationDuration = (2 + Math.random() * 2) + 's';
                moneyContainer.appendChild(money);
            }
            
            // Show success modal
            document.getElementById('successOverlay').style.display = 'flex';
            
            // Auto close after 4 seconds
            setTimeout(() => {
                document.getElementById('successOverlay').style.display = 'none';
                closeModal();
                
                // Clean up money animation
                moneyContainer.innerHTML = '';
            }, 4000);
        }

        // Close modal when clicking overlay
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Close success modal when clicking overlay
        document.getElementById('successOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (document.getElementById('successOverlay').style.display === 'flex') {
                    document.getElementById('successOverlay').style.display = 'none';
                }
                closeModal();
            }
        });