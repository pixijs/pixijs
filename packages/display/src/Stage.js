import Container from './Container';
import InnerStage from './InnerStage';
import Runner from 'mini-runner';

/**
 * Stage is a Container that takes care of add/remove events and animations
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class Stage extends Container
{
    /**
     *expect(container.parentStage).to.be.equals(stage);
     expect(child.parentStage).to.be.equals(stage);
     */
    constructor()
    {
        super();

        /**
         * The array of children of this container
         *
         * @member {Runner}
         * @readonly
         */
        this.runnerAnimate = new Runner('onAnimate', 1);

        /**
         * set of attached objects
         * @type {PIXI.InnerStage}
         */
        this.innerStage = new InnerStage(this);

        this.passParentStageToChildren = false;
    }

    onAdd(obj)
    {
        this.runnerAnimate.add(obj);
        obj.onAdded(this);
        obj.emit('added', this);
    }

    onRemove(obj)
    {
        this.runnerAnimate.remove(obj);
        obj.onRemoved(this);
        obj.emit('removed', this);
    }

    onAnimate(delta)
    {
        this.emit('animate', delta);

        this.innerStage.flushDetached();

        this.runnerAnimate.run(delta);

        this.innerStage.flushDetached();
    }
}
