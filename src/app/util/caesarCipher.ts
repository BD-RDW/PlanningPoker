type Alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';


export const caesarCipher = (text: string, shift: number, decode: boolean = false) => {
    text = text.replace(/ /g, '-');
    if (decode === true) {
        shift = 52 - shift;
    }

    const alphabet: Alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let encodedText = '';

    if (shift > 52) {
        shift = shift % 52;
    }

    let i: number = 0;
    while (i < text.length) {
        if (alphabet.indexOf(text[i]) !== -1) {
            const alphabetIndex: number = alphabet.indexOf((text[i]));

            if (alphabet[alphabetIndex + shift]) {
                encodedText += alphabet[alphabetIndex + shift];
            }
            else {
                encodedText += alphabet[alphabetIndex + shift - 52];
            }
        }
        else {
            encodedText += text[i];
        }

        i++;
    }

    return decode === true ? encodedText.replace(/-/g, ' ') : encodedText;
};
