import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { analyticsService } from './analytics.service';

const getAdminDashboardStats = catchAsync(async (req, res) => {
    const result = await analyticsService.getAdminDashboardStats();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data: result,
    });
});

const exportOrdersCSV = catchAsync(async (req, res) => {
    const csv = await analyticsService.exportOrdersToCSV();

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-export-${Date.now()}.csv`
    );

    res.status(StatusCodes.OK).send(csv);
});


export const analyticsController = {
    getAdminDashboardStats,
    exportOrdersCSV
};