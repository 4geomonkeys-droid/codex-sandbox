<?php

declare(strict_types=1);

$content = require __DIR__ . '/content.php';

$errors = [];
$sent = false;

$galleryFiles = glob(__DIR__ . '/assets/img/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE) ?: [];
$logoFiles = glob(__DIR__ . '/assets/img/logos/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}', GLOB_BRACE) ?: [];

sort($galleryFiles);
sort($logoFiles);

$galleryImages = [];
foreach ($galleryFiles as $file) {
    $galleryImages[] = 'assets/img/gallery/' . basename($file);
}

$logoImages = [];
foreach ($logoFiles as $file) {
    $logoImages[] = 'assets/img/logos/' . basename($file);
}

if ($galleryImages === []) {
    $galleryImages = $content['gallery'];
}

if ($logoImages === []) {
    $logoImages = $content['logos'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $eventDate = trim((string) ($_POST['event_date'] ?? ''));
    $message = trim((string) ($_POST['message'] ?? ''));
    $botField = trim((string) ($_POST['website'] ?? ''));

    if ($botField !== '') {
        $errors[] = 'Formulář nebylo možné odeslat.';
    }

    if ($name === '') {
        $errors[] = 'Vyplňte prosím jméno.';
    }

    if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors[] = 'Vyplňte prosím platný e-mail.';
    }

    if ($message === '') {
        $errors[] = 'Napište nám prosím základní informace o akci.';
    }

    if ($errors === []) {
        $to = $content['site']['email'];
        $subject = 'SAMOFOT: nová poptávka termínu';

        $bodyLines = [
            'Nová poptávka z webu samofot.cz',
            '',
            'Jméno: ' . $name,
            'E-mail: ' . $email,
            'Datum akce: ' . ($eventDate !== '' ? $eventDate : 'neuvedeno'),
            '',
            'Zpráva:',
            $message,
        ];

        $headers = [
            'From: SAMOFOT web <no-reply@samofot.cz>',
            'Reply-To: ' . $email,
            'Content-Type: text/plain; charset=UTF-8',
        ];

        $sent = mail($to, $subject, implode("\n", $bodyLines), implode("\r\n", $headers));

        if (!$sent) {
            $errors[] = 'Odeslání se nepodařilo. Napište nám prosím přímo na info@samofot.cz.';
        }
    }
}
?>
<!doctype html>
<html lang="cs">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($content['site']['title']) ?></title>
    <meta name="description" content="<?= htmlspecialchars($content['site']['description']) ?>">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header class="topbar">
    <div class="container topbar__inner">
        <a href="#" class="brand" aria-label="SAMOFOT domů">
            <img src="<?= file_exists(__DIR__ . '/assets/img/logo.png') ? 'assets/img/logo.png' : 'assets/img/placeholder.svg' ?>" alt="SAMOFOT logo" class="brand__logo">
        </a>
        <a href="#kontakt" class="btn btn--small"><?= htmlspecialchars($content['hero']['cta']) ?></a>
    </div>
</header>

<main>
    <section class="hero">
        <div class="container">
            <h1 id="hero-line"><?= htmlspecialchars($content['hero']['lines'][0]) ?></h1>
            <p class="hero__subtitle"><?= htmlspecialchars($content['hero']['subtitle']) ?></p>
            <div class="hero__actions">
                <a href="#kontakt" class="btn"><?= htmlspecialchars($content['hero']['cta']) ?></a>
                <a href="#cenik" class="btn btn--ghost">Zobrazit ceník</a>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2>Proč SAMOFOT</h2>
            <ul class="bullet-list">
                <?php foreach ($content['benefits'] as $benefit): ?>
                    <li><?= htmlspecialchars($benefit) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <section class="section section--alt" id="galerie">
        <div class="container">
            <h2>Galerie z akcí</h2>
            <div class="gallery">
                <?php foreach ($galleryImages as $index => $image): ?>
                    <figure class="gallery__item">
                        <img src="<?= file_exists(__DIR__ . '/' . $image) ? htmlspecialchars($image) : 'assets/img/placeholder.svg' ?>" alt="SAMOFOT galerie <?= $index + 1 ?>" loading="lazy">
                    </figure>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="section" id="jak-to-funguje">
        <div class="container">
            <h2>Jak to funguje</h2>
            <ol class="steps">
                <?php foreach ($content['process'] as $step): ?>
                    <li><?= htmlspecialchars($step) ?></li>
                <?php endforeach; ?>
            </ol>
        </div>
    </section>

    <section class="section section--alt" id="reference">
        <div class="container">
            <h2>Firmy, které si SAMOFOT vybraly</h2>
            <div class="logos">
                <?php foreach ($logoImages as $index => $logo): ?>
                    <div class="logos__item">
                        <img src="<?= file_exists(__DIR__ . '/' . $logo) ? htmlspecialchars($logo) : 'assets/img/placeholder.svg' ?>" alt="Reference logo <?= $index + 1 ?>" loading="lazy">
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="section" id="cenik">
        <div class="container pricing">
            <h2>Jednoduchý ceník</h2>
            <p class="price"><?= htmlspecialchars($content['pricing']['price']) ?></p>
            <ul class="bullet-list">
                <?php foreach ($content['pricing']['details'] as $detail): ?>
                    <li><?= htmlspecialchars($detail) ?></li>
                <?php endforeach; ?>
            </ul>
            <a href="#kontakt" class="btn"><?= htmlspecialchars($content['hero']['cta']) ?></a>
        </div>
    </section>

    <section class="section section--alt" id="faq">
        <div class="container">
            <h2>FAQ</h2>
            <div class="faq">
                <?php foreach ($content['faq'] as $item): ?>
                    <details>
                        <summary><?= htmlspecialchars($item['q']) ?></summary>
                        <p><?= htmlspecialchars($item['a']) ?></p>
                    </details>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="section" id="kontakt">
        <div class="container contact">
            <div>
                <h2>Nezávazná poptávka termínu</h2>
                <p>Napište nám na <a href="mailto:<?= htmlspecialchars($content['site']['email']) ?>"><?= htmlspecialchars($content['site']['email']) ?></a> nebo vyplňte formulář.</p>
                <p><strong>Oblast působnosti:</strong> <?= htmlspecialchars($content['site']['location']) ?></p>
            </div>

            <form method="post" class="form" novalidate>
                <?php if ($sent): ?>
                    <p class="notice notice--success">Děkujeme, poptávku jsme přijali. Brzy se ozveme.</p>
                <?php endif; ?>

                <?php if ($errors !== []): ?>
                    <div class="notice notice--error">
                        <ul>
                            <?php foreach ($errors as $error): ?>
                                <li><?= htmlspecialchars($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <label for="name">Jméno</label>
                <input type="text" id="name" name="name" required>

                <label for="email">E-mail</label>
                <input type="email" id="email" name="email" required>

                <label for="event_date">Datum akce (volitelné)</label>
                <input type="text" id="event_date" name="event_date" placeholder="např. 12. 6. 2026">

                <label for="message">Typ akce a detaily</label>
                <textarea id="message" name="message" rows="5" required></textarea>

                <input type="text" id="website" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">

                <button class="btn" type="submit"><?= htmlspecialchars($content['hero']['cta']) ?></button>
            </form>
        </div>
    </section>
</main>

<footer class="footer">
    <div class="container footer__inner">
        <p>© <?= date('Y') ?> SAMOFOT</p>
        <p><?= htmlspecialchars($content['site']['location']) ?> · Jsme plátci DPH.</p>
    </div>
</footer>

<script>
    window.SAMOFOT_HERO_LINES = <?= json_encode($content['hero']['lines'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
</script>
<script src="assets/js/main.js" defer></script>
</body>
</html>
