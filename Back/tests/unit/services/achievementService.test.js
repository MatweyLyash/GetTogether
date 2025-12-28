const achievementService = require('../../../services/achievementService');
const models = require('../../../models');

jest.mock('../../../models');

describe('AchievementService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addProgress()', () => {
        it('should throw error if achievement not found', async () => {
            models.Achievement.findByPk.mockResolvedValue(null);
            await expect(achievementService.addProgress(1, 1))
                .rejects.toThrow('Achievement not found');
        });

        it('should correctly add progress and unlock achievement', async () => {
            const mockAchievement = { id: 1, score: 3 };
            const mockUserAchievement = {
                user_id: 1,
                achievement_id: 1,
                progress: 1,
                is_unlocked: false,
                metadata: { processedKeys: [] },
                save: jest.fn().mockResolvedValue(true)
            };

            models.Achievement.findByPk.mockResolvedValue(mockAchievement);
            models.UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement, true]);

            const result = await achievementService.addProgress(1, 1, 2);

            expect(result.progress).toBe(3);
            expect(result.is_unlocked).toBe(true);
            expect(mockUserAchievement.save).toHaveBeenCalled();
        });

        it('should not add progress if key already processed', async () => {
            const mockAchievement = { id: 1, score: 3 };
            const mockUserAchievement = {
                user_id: 1,
                achievement_id: 1,
                progress: 1,
                is_unlocked: false,
                metadata: { processedKeys: ['key1'] },
                save: jest.fn()
            };

            models.Achievement.findByPk.mockResolvedValue(mockAchievement);
            models.UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement, true]);

            await achievementService.addProgress(1, 1, 1, 'key1');

            expect(mockUserAchievement.progress).toBe(1);
            expect(mockUserAchievement.save).not.toHaveBeenCalled();
        });
    });

    describe('processApply()', () => {
        it('should call addProgress for matching achievements', async () => {
            const mockAchievements = [
                { id: 1, trigger: 'apply', condition_event_id: null },
                { id: 2, trigger: 'apply', condition_event_id: 100 }
            ];

            models.Achievement.findAll.mockResolvedValue(mockAchievements);
            const addProgressSpy = jest.spyOn(achievementService, 'addProgress').mockResolvedValue({});

            await achievementService.processApply(1, 100);

            // Both should match: one with null (global) and one with 100 (matching ID)
            expect(addProgressSpy).toHaveBeenCalledTimes(2);
        });
    });
});
