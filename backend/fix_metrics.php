<?php
$file = 'app/Services/MetricsService.php';
$content = file_get_contents($file);
$content = preg_replace('/(getOrRegister[A-Za-z]+|register[A-Za-z]+)\(\s*\'velora_([^\']+)\',/s', '$1(\'velora\', \'$2\',', $content);
file_put_contents($file, $content);
echo "Replaced";
