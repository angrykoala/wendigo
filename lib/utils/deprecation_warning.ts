export default function deprecationWarning(deprecatedMethod: string, alternative: string): void {
    const alternativeMsg = alternative ? `, use ${alternative} instead` : " ";
    console.warn(`Deprecation Warning: ${deprecatedMethod} is deprecated${alternativeMsg}.`);
}
