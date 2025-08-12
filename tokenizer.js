export const libraryOfTokens = [
  "<UKN>",
  "<BOS>",
  "<EOS>",
];

export function decode(input){
  if (typeof input === 'number' && libraryOfTokens[input]){
    return libraryOfTokens[input];
  } else {
    return libraryOfTokens[0];
  }
}

export function encode(input){
  const index = libraryOfTokens.indexOf(input);
  if(index !== -1){
    return index;
  } else {
    libraryOfTokens.push(input);
    return libraryOfTokens.length - 1; // Return the new index
  }
}

export function splitTheString(input) {
  const arrayToReturn = [1];
  const words = input.split(' ');
  words.forEach((word) => {
    if (word) {
      const encodedWord = encode(word);
      arrayToReturn.push(encodedWord);
    }
  });
  arrayToReturn.push(2);
  return arrayToReturn;
}