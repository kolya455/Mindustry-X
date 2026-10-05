package doubleturretrange;

import mindustry.content.ContentType;
import mindustry.mod.Mod;
import mindustry.world.blocks.defense.turrets.BaseTurret;

public class DoubleTurretRangeMod extends Mod {
    @Override
    public void init() {
        for (int i = 0; i < ContentType.block.all().size; i++) {
            var b = ContentType.block.all().get(i);
            if (b instanceof BaseTurret bt) {
                bt.range *= 2f;
            }
        }
    }
}
