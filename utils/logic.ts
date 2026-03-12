import { Solution } from '../types';

export const calculateNetwork = (serverCount: number): Solution[] => {
  const solutions: Solution[] = [];

  // Edge case protection
  if (serverCount <= 0) return [];

  // 1. 直连策略 (1-2台)
  // 规则：1到2台910B服务器可不配置RoCe交换机，2台可采用卡间直连
  if (serverCount <= 2) {
    solutions.push({
      id: 'direct-connect',
      name: '卡间直连 (无交换机)',
      description: '极小规模的高性价比方案，无交换机成本。',
      leafCount: 0,
      spineCount: 0,
      leafModel: 'N/A',
      spineModel: null,
      maxCapacity: 2,
      scalable: false,
      notes: [
        '采用计算卡直接互连模式',
        '零交换机成本投入',
        '仅限2台及以下规模，不可扩展'
      ]
    });
  }

  // 2. 1-4台：可选 16*200G + 8*400G Leaf交换机
  // 规则：不支持扩容到4台以上
  if (serverCount <= 4) {
    solutions.push({
      id: 'small-leaf',
      name: '入门级单Leaf组网',
      description: '适合小规模固定集群，成本较低。',
      leafCount: 1,
      spineCount: 0,
      leafModel: '16*200G + 8*400G 混合端口交换机',
      spineModel: null,
      maxCapacity: 4,
      scalable: false,
      notes: [
        '单台Leaf，所有端口用于下行',
        '最大支持4台服务器',
        '不支持扩容至4台以上'
      ]
    });
  }

  // 3. 1-8台：可选 32*400GE Leaf交换机
  // 规则：限制是不支持扩容到8台以上
  if (serverCount <= 8) {
    solutions.push({
      id: 'std-leaf',
      name: serverCount === 8 ? '标准单Leaf组网 (省钱优选)' : '标准单Leaf组网',
      description: serverCount === 8 ? '成本最低的8台满配方案，但牺牲未来扩展性。' : '高性能单层RoCE组网，全400GE吞吐。',
      leafCount: 1,
      spineCount: 0,
      leafModel: '32*400GE 交换机',
      spineModel: null,
      maxCapacity: 8,
      scalable: false,
      notes: [
        '单台Leaf，所有端口用于下行',
        '提供全带宽无阻塞转发',
        '单机最大支持8台，不可扩展至Spine架构'
      ]
    });
  }

  // 4. 大于等于8台：Spine-Leaf 架构
  // 规则：
  // Leaf数量 = 向上取整(服务器数量 / 4)
  // Spine数量 = Leaf数量 / 2 (按2的幂次向上取整: 1, 2, 4, 8, 16...)
  if (serverCount >= 8) {
    const leafCount = Math.ceil(serverCount / 4);
    let rawSpineNeeded = leafCount / 2; // 题目规则：Leaf数量/2
    
    // 按2的幂次向上取整
    let spineCount = 1;
    if (rawSpineNeeded > 0) {
        // 如果 rawSpineNeeded < 1 (例如Leaf=1, raw=0.5), 幂次取1
        // 如果 rawSpineNeeded = 1.5, 幂次取2
        // 如果 rawSpineNeeded = 3, 幂次取4
        let p = 1;
        while (p < rawSpineNeeded) {
            p *= 2;
        }
        spineCount = p;
    }

    // 计算连线数说明: 每台spine与leaf互联的线条 = Leaf数量 * 16 / Spine数量
    const linksPerSpine = (leafCount * 16) / spineCount;

    solutions.push({
      id: 'spine-leaf-clos',
      name: serverCount === 8 ? 'Spine-Leaf 二层CLOS架构 (扩展优选)' : 'Spine-Leaf 二层CLOS架构',
      description: serverCount === 8 ? '初期成本较高，但支持未来向更大规模集群无缝扩容。' : '面向大规模AI集群的标准无阻塞架构。',
      leafCount: leafCount,
      spineCount: spineCount,
      leafModel: 'Leaf交换机 (32*400GE)',
      spineModel: 'Spine交换机 (64*400GE)',
      maxCapacity: leafCount * 4, 
      scalable: true,
      notes: [
        `Leaf计算: ⌈${serverCount}/4⌉ = ${leafCount} 台 (每台下挂4台服务器)`,
        `Spine计算: Leaf/2 取2的幂次 = ${spineCount} 台`,
        `连线规则: 每台Spine下行连线数 = ${linksPerSpine} 根 (Total ${leafCount * 16})`,
        '全网无收敛，支持大规模线性扩展'
      ]
    });
  }
  
  return solutions;
};