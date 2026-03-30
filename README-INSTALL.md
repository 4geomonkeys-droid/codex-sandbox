# SAMOFOT web (PHP)

## Instalace
1. Zálohujte původní obsah webu.
2. Nahrajte všechny soubory z tohoto balíčku do kořene domény (`public_html` apod.).
3. Doplňte obrázky:
   - hlavní logo: `assets/img/logo.png`
   - fotky z akcí: nahrajte je do `assets/img/gallery/`
   - loga referencí: nahrajte je do `assets/img/logos/`
4. Galerie i loga se načítají automaticky podle toho, co v těchto složkách najdou (názvy souborů mohou být libovolné).
5. Hotovo.

## Jak upravovat obsah
Většina textů je v souboru `content.php`.

- Hero věty: `hero.lines`
- Výhody: `benefits`
- Postup: `process`
- Ceník: `pricing`
- FAQ: `faq`
- E-mail/lokalita: `site`

## Formulář
Formulář používá vestavěnou PHP funkci `mail()`. Pokud hosting e-maily neodesílá, budou se uživatelům zobrazovat pokyny poslat e-mail ručně na `info@samofot.cz`.
