// src/shared/utils/phone.ts
// Numéros malgaches : l'utilisateur ne saisit que les 9 chiffres après « +261 » (ex. xx xx xxx xx).
// Même règle que le backend (app/util/phone.py).

export const MG_PHONE_LENGTH = 9;
export const MG_MOBILE_PREFIXES = ['32', '33', '34', '37', '38'];

/**
 * À appeler à chaque frappe / collage : ne garde que les chiffres, ignore l'indicatif (+261, 261, 00261)
 * et le 0 national (032… → 32…), limite à 9 chiffres.
 */
export function normalizeMgPhone(raw: string): string {
    let digits = (raw || '').replace(/\D/g, '');

    if (digits.startsWith('00261')) {
        digits = digits.slice(5);
    } else if (digits.startsWith('261')) {
        digits = digits.slice(3);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    return digits.slice(0, MG_PHONE_LENGTH);
}

/** 34XXXXXXX → « 34 XX XXX XX » (affichage seulement, la valeur gardée reste les chiffres). */
export function formatMgPhone(digits: string): string {
    const groups = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 7), digits.slice(7, 9)];
    return groups.filter(Boolean).join(' ');
}

/** Retourne un message d'erreur, ou '' si le numéro est valide. */
export function validateMgPhone(digits: string): string {
    if (!digits) {
        return 'Le numéro est requis';
    }
    if (!MG_MOBILE_PREFIXES.includes(digits.slice(0, 2)) && digits.length >= 2) {
        return `Le numéro doit commencer par ${MG_MOBILE_PREFIXES.join(', ')}`;
    }
    if (digits.length !== MG_PHONE_LENGTH) {
        return `Saisissez les ${MG_PHONE_LENGTH} chiffres après +261 (exemple : xx xx xxx xx)`;
    }
    return '';
}
