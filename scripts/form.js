document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const successMessage = document.getElementById('successMessage');

    // Validation functions
    function validateName(name) {
        const words = name.trim().split(/\s+/);
        return words.length >= 2 && words.every(word => word.length > 0);
    }

    function validatePhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        return /^[6789]\d{8}$/.test(cleanPhone);
    }

    function validateEmail(email) {
        if (!email.trim()) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const fieldGroup = document.getElementById(fieldId).closest('.form-group');

        errorElement.textContent = message;
        fieldGroup.classList.add('error');
    }

    function clearError(fieldId) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const fieldGroup = document.getElementById(fieldId).closest('.form-group');

        errorElement.textContent = '';
        fieldGroup.classList.remove('error');
    }

    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const errorGroups = document.querySelectorAll('.form-group.error');

        errorElements.forEach(el => el.textContent = '');
        errorGroups.forEach(group => group.classList.remove('error'));
    }

    function validateForm() {
        clearAllErrors();
        let isValid = true;

        // Validate name
        const nombre = document.getElementById('nombre').value;
        if (!validateName(nombre)) {
            showError('nombre', 'Por favor, introduzca nombre y apellidos');
            isValid = false;
        }

        // Validate phone
        const telefono = document.getElementById('telefono').value;
        if (!validatePhone(telefono)) {
            showError('telefono', 'Número de teléfono español inválido (9 dígitos: 6, 7, 8 o 9)');
            isValid = false;
        }

        // Validate email
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            showError('email', 'Formato de email inválido');
            isValid = false;
        }

        // Validate service selection
        const servicioSelected = document.querySelector('input[name="servicio"]:checked');
        if (!servicioSelected) {
            document.getElementById('servicioError').textContent = 'Por favor, seleccione un servicio';
            isValid = false;
        }

        // Validate message
        const mensaje = document.getElementById('mensaje').value;
        if (!mensaje.trim()) {
            showError('mensaje', 'Por favor, escriba su consulta');
            isValid = false;
        }

        // Validate privacy policy
        const privacidad = document.getElementById('privacidad').checked;
        if (!privacidad) {
            document.getElementById('privacidadError').textContent = 'Debe aceptar la política de privacidad';
            isValid = false;
        }

        return isValid;
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            const submitButton = form.querySelector('.submit-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            // Create FormData
            const formData = new FormData(form);

            // Send to PHP
            fetch('process_form.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    successMessage.textContent = data.message;
                    successMessage.style.display = 'block';
                    form.reset();
                    form.style.display = 'none';
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al enviar el formulario. Por favor, inténtelo de nuevo.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Pedir cita';
            });
        }
    });

    // Real-time validation
    document.getElementById('nombre').addEventListener('blur', function() {
        if (this.value && !validateName(this.value)) {
            showError('nombre', 'Por favor, introduzca nombre y apellidos');
        } else {
            clearError('nombre');
        }
    });

    document.getElementById('telefono').addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            showError('telefono', 'Número de teléfono español inválido');
        } else {
            clearError('telefono');
        }
    });

    document.getElementById('email').addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('email', 'Formato de email inválido');
        } else {
            clearError('email');
        }
    });
});