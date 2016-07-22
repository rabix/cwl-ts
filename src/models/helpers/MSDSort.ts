export interface MSDSortable {
    sortingKey: Array<number | string>
}

export class MSDSort {
    public static sort(array: MSDSortable[]): void {
        // maximum length of sorting key
        const MAX = Math.max(...(array.map(item => item.sortingKey.length)));

        // normalize sorting keys so they're the same length
        array.forEach(item => {
            if (item.sortingKey.length < MAX) {
                let i = item.sortingKey.length;
                while(i < MAX) {
                    item.sortingKey.push('');
                    i++;
                }
            }
        });

        // sort by comparing each part's sorting key
        array.sort((a, b) => {
            let i = 0;
            // iterate through all elements of sorting key
            while(i < MAX) {
                // if current index matches, check next
                if (a.sortingKey[i] === b.sortingKey[i]){
                    i++;
                // if current index doesn't match, return appropriate value
                } else if (a.sortingKey[i] > b.sortingKey[i]){
                    return 1;
                } else {
                    return -1;
                }
            }

            // if while loop has ended, sorting keys are identical, return 0
            return 0;
        });
    }
}