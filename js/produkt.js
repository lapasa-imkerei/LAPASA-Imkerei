fetch('/csv/produkt.csv')
    .then(response => response.text())
    .then(data => {
        // Bereinigt unsichtbare Windows-Zeilenumbrüche und teilt die Zeilen
        const rows = data.replace(/\r/g, '').split('\n').slice(1);
        const container = document.getElementById('produkt-container');
        let productsByCategory = {};

        // 1. Dein Wörterbuch (Kategorien und ihre Suchbegriffe)
        // Alles in Kleinbuchstaben schreiben!
        const categoryDictionary = {
            "Honig": ["honig", "cremehonig", "waldhonig"],
            "Oxymel": ["oxymel", "sauerhonig"],
            "Naturkosmetik": ["salbe", "lippenpflege", "seife", "balsam", "creme"],
            "Bienenwachs": ["wachs", "kerze", "teelicht", "mittelwand"]
        };

        // 2. Die Funktion, die die richtige Kategorie findet
        function getCategory(textToSearch) {
            const text = textToSearch.toLowerCase();
            for (const [category, keywords] of Object.entries(categoryDictionary)) {
                // Wenn ein Stichwort gefunden wird, gib die Kategorie zurück
                if (keywords.some(keyword => text.includes(keyword))) {
                    return category;
                }
            }
            return "Sonstiges"; // Fallback, falls nichts passt
        }

        // 3. Zeilen auslesen und sortieren
        rows.forEach(row => {
            const cols = row.split(';');
            
            // Sicherheitscheck: Überspringe Zeilen, die nicht vollständig sind
            if (cols.length < 8) return; 

            const produkt = cols[1];
            const einheit = cols[2];
            const preis = cols[7];
            const beschreibung = cols[9] || ""; // Falls leer, setze leeren Text

            if (!produkt) return; // Leere Einträge ignorieren

            // Kombiniere Name und Beschreibung für die Stichwortsuche
            const kategorie = getCategory(produkt + " " + beschreibung);

            if (!productsByCategory[kategorie]) productsByCategory[kategorie] = [];
            productsByCategory[kategorie].push({ produkt, beschreibung, einheit, preis });
        });

        // 4. Das HTML zusammenbauen (jetzt inkl. Beschreibung)
        for (const [kategorie, items] of Object.entries(productsByCategory)) {
            let section = document.createElement('section');
            section.className = 'product-section';
            
            section.innerHTML = `<h2>${kategorie}</h2>
                <table class="lapasa-table">
                    <thead>
                        <tr>
                            <th>Produkt</th>
                            <th>Beschreibung</th>
                            <th>Inhalt</th>
                            <th>Preis</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr>
                            <td><strong>${item.produkt}</strong></td>
                            <td style="font-size: 0.85em; opacity: 0.8;">${item.beschreibung}</td>
                            <td>${item.einheit}</td>
                            <td>${item.preis} €</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
            container.appendChild(section);
        }
    })
    .catch(error => console.error('Fehler beim Laden der CSV:', error));