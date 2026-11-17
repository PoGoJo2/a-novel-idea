const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const AppError = require('../utils/AppError');

// Finds a group and works out how the logged-in user relates to it:
// the leader (or an admin), an active member, or neither (which is refused).
const getGroupAccess = async (groupId, user) => {
  const group = await ReadingGroup.findById(groupId);
  if (!group) throw new AppError('Reading group not found', 404);

  const isLeader = String(group.leader) === String(user._id) || user.role === 'admin';
  if (isLeader) return { group, isLeader: true };

  const membership = await Membership.findOne({ user: user._id, group: group._id, status: 'active' });
  if (!membership) throw new AppError('Only members of this group can see that', 403);
  return { group, isLeader: false, membership };
};

const requireLeader = async (groupId, user) => {
  const access = await getGroupAccess(groupId, user);
  if (!access.isLeader) throw new AppError('Only the group leader can do that', 403);
  return access.group;
};

module.exports = { getGroupAccess, requireLeader };
