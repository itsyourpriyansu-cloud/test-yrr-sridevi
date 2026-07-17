<?php
error_reporting(E_ALL & ~E_NOTICE);
/* include ('header.php');
include_once 'includes/inc_config.php'; */
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');


$siteKey = '6Le5gNAsAAAAABqVmMyneZdn4fNI83hMDkIDFtU6';    //6LdOsfErAAAAAFZQH0L1Vid2_ZbQ3lKyZd5pQzbm
$secretKey = '6Le5gNAsAAAAAIbwihKwL-ibfSOGsT4J-p_0WntD';  //6LdOsfErAAAAAN_N3fZL5C997AxjFjpAw7H6GQLp



use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Email configuration
$fromName = "Real Rise";
$formEmail = 'contactforum@yoshithainfra.in';
// $formEmail = 'donotreply@envizondesigns.com';
// $emailCc = 'keshanth169@gmail.com';
//$emailCc = 'shiva.krishna22@gmail.com';
//$emailBcc = 'sathish@gigaqwal.com';
$toEmail = 'kapalasri@gmail.com';
$statusMsg = 'An error occurred. Please try again.';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response'])) {
        $captcha = $_POST['g-recaptcha-response'];
        $ip = $_SERVER['REMOTE_ADDR'];
        $url = 'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secretKey) . '&response=' . urlencode($captcha);
        $response = file_get_contents($url);
        $responseKeys = json_decode($response, true);

        if ($responseKeys['success']) {
            $name = htmlspecialchars(trim($_POST['name'] ?? ''));
            $email = htmlspecialchars(trim($_POST['email'] ?? ''));
            $phone = htmlspecialchars(trim($_POST['phone'] ?? ''));
            $cmnts = htmlspecialchars(trim($_POST['message'] ?? ''));

            if ($name === '' || $email === '' || $cmnts === '') {
                echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
                exit;
            }

            $subject = 'Thank You for Contacting Real Rise';
            $htmlContent = "
            <!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>
            <html>
            <head>
            <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
            <title>Thank You for Contacting Real Rise</title>
            </head>
            <body>
            <div class='jumbotron card card-body' style='box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;'>
            <h2>New Inquiry From Website</h2>
            <p>Dear Yoshitha Sridevi,</p>
            <p>We have received your inquiry and will get back to you as soon as possible.</p>
            <p>Here are the details you provided:</p>
            <ul>
                <li><b>Name:</b> $name</li>
                <li><b>Email:</b> $email</li>
                <li><b>Phone:</b> $phone</li>
                <li><b>Comments:</b> $cmnts</li>
            </ul>
            <p>Thank you for your interest in Real Rise.</p>
            </div>
            </body>
            </html>
            ";

            // Send email in the background
            $mail = new PHPMailer(true);
            try {
				//  $mail->isSMTP();
				//  $mail->SMTPDebug = 2;
                // $mail->Host = 'smtp.gmail.com'; // Your SMTP host
                // $mail->SMTPSecure = 'tls';
               
                // $mail->Port = 587; // Your SMTP port
                // $mail->SMTPAuth = false; // Disable SMTP authentication
                // $mail->SMTPSecure = false; // Disable encryption
                // $mail->setFrom($formEmail, $fromName);
                // $mail->addAddress($toEmail, $fromName);
               $mail = new PHPMailer(true);

$mail->isSMTP();
$mail->SMTPDebug = 0;
$mail->Host = 'smtp.hostinger.com';
$mail->Port = 587;
$mail->SMTPAuth = true;
$mail->SMTPSecure = 'tls';

$mail->Username = 'contactforum@yoshithainfra.in';
$mail->Password = 'Yoshitha@2324!';

$mail->setFrom($formEmail, $fromName);
$mail->addAddress($toEmail);

$mail->isHTML(true);
$mail->Subject = $subject;
$mail->Body = $htmlContent;

$mail->send();
                
                
                                // -------------------------------
                // SEND THANK YOU EMAIL TO USER
                // -------------------------------
                $userMail = new PHPMailer(true);
                try {
                    // $userMail->isSMTP();
                    // $userMail->Host = 'smtp.gmail.com';
                    // $mail->SMTPSecure = 'tls';
                    
                    // $userMail->Port = 587;
                    // $userMail->SMTPAuth = false;
                    // $userMail->SMTPSecure = false;
                    $userMail = new PHPMailer(true);

$userMail->isSMTP();
$userMail->SMTPDebug = 0;
$userMail->Host = 'smtp.hostinger.com';
$userMail->Port = 587;
$userMail->SMTPAuth = true;
$userMail->SMTPSecure = 'tls';

$userMail->Username = 'contactforum@yoshithainfra.in';
$userMail->Password = 'Yoshitha@2324!';

$userMail->setFrom($formEmail, $fromName);
$userMail->addAddress($email, $name);

$userMail->isHTML(true);
$userMail->Subject = "Thank You for Contacting Real Rise";

$userMail->Body = "
<h2>Thank You for  Contacting Real Rise</h2>
<p>Dear $name,</p>
<p>We received your enquiry and our team will contact you shortly.</p>
<p>Regards,<br>Real Rise Team</p>
";

$userMail->send();
                } catch (Exception $e) {
                    error_log('User thank-you mail failed: ' . $userMail->ErrorInfo);
                }
                
                
                
                // Log success message
                $statusMsg = 'Email has been sent successfully.';
                echo json_encode(['success' => true, 'message' => $statusMsg]);
            } catch (Exception $e) {
                // Log error message
                error_log('Contact form mail failed: ' . $mail->ErrorInfo);
                echo json_encode(['success' => false, 'message' => 'Email could not be sent. Please try again later.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Captcha verification failed. Please try again.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Please verify that you are not a robot.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>