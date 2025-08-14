<?php
// Configuración de email - Cambia estos valores por los de tu hosting
$to_email = "tu-email@tudominio.com"; // Cambia por tu email corporativo de Hostalia
$from_email = "noreply@tudominio.com"; // Cambia por un email válido de tu dominio

// Verificar que la petición sea POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// Obtener y sanitizar datos del formulario
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$servicio = isset($_POST['servicio']) ? trim($_POST['servicio']) : '';
$mensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';
$privacidad = isset($_POST['privacidad']) ? $_POST['privacidad'] : '';

// Validaciones del servidor
$errors = [];

// Validar nombre (mínimo 2 palabras)
if (empty($nombre)) {
    $errors[] = "El nombre es obligatorio";
} else {
    $palabras = explode(' ', $nombre);
    $palabras = array_filter($palabras, function($palabra) { return !empty(trim($palabra)); });
    if (count($palabras) < 2) {
        $errors[] = "Por favor, introduzca nombre y apellidos";
    }
}

// Validar teléfono español
if (empty($telefono)) {
    $errors[] = "El teléfono es obligatorio";
} else {
    $telefono_limpio = preg_replace('/[^0-9]/', '', $telefono);
    if (!preg_match('/^[6789][0-9]{8}$/', $telefono_limpio)) {
        $errors[] = "Número de teléfono español inválido";
    }
}

// Validar email si se proporciona
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Formato de email inválido";
}

// Validar servicio
if (empty($servicio) || !in_array($servicio, ['ODONTOLOGÍA', 'PODOLOGÍA'])) {
    $errors[] = "Debe seleccionar un servicio";
}

// Validar mensaje
if (empty($mensaje)) {
    $errors[] = "El mensaje es obligatorio";
}

// Validar aceptación de privacidad
if ($privacidad !== 'on') {
    $errors[] = "Debe aceptar la política de privacidad";
}

// Si hay errores, devolver respuesta de error
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => implode(", ", $errors)]);
    exit;
}

// Preparar el email
$asunto = "CONTACTO WEB - " . $nombre;

$cuerpo_email = $nombre . " está intentando contactar con usted a través de la página web, sus datos son:\n\n";
$cuerpo_email .= "- Nombre: " . $nombre . "\n";
$cuerpo_email .= "- Teléfono: " . $telefono . "\n";
$cuerpo_email .= "- Correo electrónico: " . ($email ? $email : "No proporcionado") . "\n";
$cuerpo_email .= "- Servicio solicitado: " . $servicio . "\n\n";
$cuerpo_email .= "Su mensaje dice: " . $mensaje;

// Headers del email
$headers = array(
    'From' => $from_email,
    'Reply-To' => $email ? $email : $from_email,
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'PHP/' . phpversion()
);

$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= $key . ': ' . $value . "\r\n";
}

// Enviar el email
$email_enviado = mail($to_email, $asunto, $cuerpo_email, $headers_string);

// Responder al cliente
header('Content-Type: application/json');
if ($email_enviado) {
    echo json_encode([
        "success" => true, 
        "message" => "Su solicitud de cita ha sido enviada correctamente. Nos pondremos en contacto con usted pronto."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error al enviar el email. Por favor, inténtelo de nuevo más tarde."
    ]);
}
?>