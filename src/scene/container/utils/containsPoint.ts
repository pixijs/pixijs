// import { Matrix } from '../../../maths/matrix/Matrix';
// import { Point } from '../../../maths/point/Point';
// import { updateTransformBackwards } from '../bounds/getGlobalBounds';
// import { updateLocalTransform } from './updateLocalTransform';

// import type { PointData } from '../../../maths/point/PointData';
// import type { Container } from '../Container';

export function containsPoint()
{
    // loop back to root..
    // then go through and apply the inverse matrix to the point...
    // keep applying as we go through the children..

}
// const tempPoint = new Point();

// export function containsPoint(target: Container, point: PointData, skipUpdateTransform: boolean)
// {
//     // loop back to root..
//     // then go through and apply the inverse matrix to the point...
//     // keep applying as we go through the children..
//     ensureTransform();
// //
//     return _containsPoint(target, point);
// }

// export function _containsPoint(
//     target: Container,
//     point: PointData,
// ): boolean
// {
//     if (target.visible) return false;

//     const localPoint = target.worldTransform.applyInverse(point, tempPoint);

//     if (target.view)
//     {
//         if (target.view.containsPoint(localPoint))
//         {
//             return true;
//         }
//     }

//     for (let i = 0; i < target.children.length; i++)
//     {
//         if (_containsPoint(target.children[i], point))
//         {
//             return true;
//         }
//     }

//     return false;
// }
