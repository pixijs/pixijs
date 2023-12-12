import { Matrix } from '../../../../maths/matrix/Matrix';

const matrixPool: Matrix[] = [];
let matrixPoolIndex = 0;

export function getMatrix(): Matrix
{
    matrixPoolIndex--;

    if (matrixPoolIndex < 0)
    {
        matrixPoolIndex = 0;

        return new Matrix();
    }

    return matrixPool[matrixPoolIndex];
}

export function returnMatrix(matrix: Matrix)
{
    matrixPool[matrixPoolIndex++] = matrix;
}
