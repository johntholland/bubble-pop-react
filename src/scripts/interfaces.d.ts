interface IBubble {
    id: string,
    color: string,
}

interface IBoard {
    columns: Array<IBubble>,
    rows: Array<IBubble>,
    completed: boolean
}